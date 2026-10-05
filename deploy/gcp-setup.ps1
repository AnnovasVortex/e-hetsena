# Préparation GCP d'e-hetsena (projet tairoraims) : base, secrets et droits IAM.
# Ne contient aucun secret : les mots de passe sont générés ici et vont directement dans Secret Manager.
#
# Lancement (contourne la stratégie d'exécution pour ce seul script) :
#   powershell -ExecutionPolicy Bypass -File deploy\gcp-setup.ps1

$ErrorActionPreference = 'Stop'
$Project  = 'tairoraims'
$Region   = 'europe-west1'
$Instance = 'ehetsena-pg'
$Bucket   = 'tairoraims-ehetsena-photos'
$SA       = "ehetsena-api@$Project.iam.gserviceaccount.com"
$Conn     = "${Project}:${Region}:${Instance}"

function New-RandomHex([int]$bytes) {
  $buf = New-Object byte[] $bytes
  [System.Security.Cryptography.RandomNumberGenerator]::Create().GetBytes($buf)
  -join ($buf | ForEach-Object { $_.ToString('x2') })
}

function Invoke-Gcloud {
  & gcloud.cmd @args
  if ($LASTEXITCODE -ne 0) { throw "Échec : gcloud $($args -join ' ')" }
}

Write-Host '1/4 Vérification de l''instance Cloud SQL...'
$state = & gcloud.cmd sql instances describe $Instance --project=$Project --format='value(state)'
if ($state -ne 'RUNNABLE') { throw "L'instance $Instance n'est pas prête (état : $state). Réessayez dans quelques minutes." }

Write-Host '2/4 Base de données et utilisateur...'
Invoke-Gcloud sql databases create ehetsena_db --instance=$Instance --project=$Project
$dbPass = New-RandomHex 24
Invoke-Gcloud sql users create ehetsena --instance=$Instance --project=$Project --password=$dbPass

Write-Host '3/4 Secrets (Secret Manager)...'
$dbUrl = "postgresql://ehetsena:$dbPass@localhost/ehetsena_db?host=/cloudsql/$Conn&schema=public"
$tmp = New-TemporaryFile
try {
  [System.IO.File]::WriteAllText($tmp, $dbUrl)
  Invoke-Gcloud secrets create ehetsena-database-url --project=$Project --replication-policy=automatic --data-file=$tmp
  [System.IO.File]::WriteAllText($tmp, (New-RandomHex 48))
  Invoke-Gcloud secrets create ehetsena-jwt-secret --project=$Project --replication-policy=automatic --data-file=$tmp
} finally {
  Remove-Item $tmp -Force
}

Write-Host '4/4 Droits du compte de service de l''API...'
Invoke-Gcloud projects add-iam-policy-binding $Project --member="serviceAccount:$SA" --role=roles/cloudsql.client --condition=None --quiet
foreach ($secret in 'ehetsena-database-url', 'ehetsena-jwt-secret') {
  Invoke-Gcloud secrets add-iam-policy-binding $secret --project=$Project --member="serviceAccount:$SA" --role=roles/secretmanager.secretAccessor --quiet
}
Invoke-Gcloud storage buckets add-iam-policy-binding "gs://$Bucket" --member="serviceAccount:$SA" --role=roles/storage.objectAdmin --quiet

# Pas de lecture publique du bucket : l'organisation interdit allUsers,
# les photos sont relayées par l'API (GET /api/uploads/:fichier)

Write-Host ''
Write-Host 'Terminé. Claude peut maintenant créer les tables et déployer les services.' -ForegroundColor Green
