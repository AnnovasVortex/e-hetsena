'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { X, Send } from 'lucide-react';
import { authFetch, isLoggedIn, loginUrl } from '@/lib/session';

interface VideoComment {
  id: string;
  content: string;
  createdAt: string;
  user: { id: string; fullName: string; avatarUrl?: string | null };
}

interface CommentsDrawerProps {
  videoId: string;
  isOpen: boolean;
  onClose: () => void;
  onCommentAdded: () => void;
}

/** Temps écoulé court (« 5 min », « 2 h », « 3 j ») */
function timeAgo(date: string) {
  const minutes = Math.floor((Date.now() - new Date(date).getTime()) / 60000);
  if (minutes < 1) return 'izao (maintenant)';
  if (minutes < 60) return `${minutes} min`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} h`;
  return `${Math.floor(hours / 24)} j`;
}

export function CommentsDrawer({ videoId, isOpen, onClose, onCommentAdded }: CommentsDrawerProps) {
  const [comments, setComments] = useState<VideoComment[] | null>(null);
  const [content, setContent] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const loggedIn = isOpen && isLoggedIn();

  // Chargement à l'ouverture uniquement (économie de data)
  useEffect(() => {
    if (!isOpen) return;
    setComments(null);
    fetch(`/api/videos/${videoId}/comments`)
      .then((res) => (res.ok ? res.json() : []))
      .then(setComments)
      .catch(() => setComments([]));
  }, [isOpen, videoId]);

  if (!isOpen) return null;

  const send = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;
    setIsSending(true);
    setError(null);
    try {
      const res = await authFetch(`/api/videos/${videoId}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: content.trim() }),
      });
      if (res.status === 401) {
        setError('Midira aloha (Connectez-vous pour commenter)');
        return;
      }
      if (!res.ok) throw new Error();
      const comment: VideoComment = await res.json();
      setComments((prev) => [comment, ...(prev || [])]);
      setContent('');
      onCommentAdded();
    } catch {
      setError('Tsy lasa ny hafatra (Envoi impossible)');
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-end justify-center"
      onClick={(e) => {
        e.stopPropagation();
        onClose();
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-lg h-[70dvh] bg-white dark:bg-stone-900 rounded-t-3xl border-t border-stone-200 dark:border-stone-800 animate-slide-up flex flex-col"
      >
        <div className="flex items-center justify-between px-5 py-3 border-b border-stone-100 dark:border-stone-800">
          <h3 className="font-bold text-base text-stone-900 dark:text-stone-100">
            Hevitra (Commentaires){comments ? ` · ${comments.length}` : ''}
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-full hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-700 dark:text-stone-300"
            aria-label="Fermer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-3 space-y-4">
          {comments === null &&
            [1, 2, 3].map((i) => (
              <div key={i} className="h-10 rounded-xl bg-stone-100 dark:bg-stone-800 animate-pulse" />
            ))}

          {comments?.length === 0 && (
            <p className="py-10 text-center text-sm text-stone-500 dark:text-stone-400">
              Mbola tsy misy hevitra. Ianao no voalohany ! (Soyez le premier à commenter)
            </p>
          )}

          {comments?.map((c) => (
            <div key={c.id} className="flex gap-3">
              <div className="w-8 h-8 shrink-0 rounded-full bg-[#D35400]/15 text-[#D35400] text-xs font-bold flex items-center justify-center overflow-hidden">
                {c.user.avatarUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={c.user.avatarUrl} alt="" className="w-full h-full object-cover" />
                ) : (
                  c.user.fullName.charAt(0).toUpperCase()
                )}
              </div>
              <div className="min-w-0">
                <p className="text-xs text-stone-500 dark:text-stone-400">
                  <span className="font-bold text-stone-800 dark:text-stone-200">{c.user.fullName}</span>
                  {' · '}
                  {timeAgo(c.createdAt)}
                </p>
                <p className="text-sm text-stone-800 dark:text-stone-200 break-words">{c.content}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="px-4 py-3 border-t border-stone-100 dark:border-stone-800 pb-[calc(0.75rem+env(safe-area-inset-bottom))]">
          {error && <p className="text-xs text-red-600 mb-2">{error}</p>}
          {loggedIn ? (
            <form onSubmit={send} className="flex items-center gap-2">
              <input
                value={content}
                onChange={(e) => setContent(e.target.value)}
                maxLength={300}
                placeholder="Manorata hevitra... (Écrire un commentaire)"
                className="flex-1 px-4 py-2.5 bg-stone-100 dark:bg-stone-800 rounded-full text-sm text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-[#D35400]"
              />
              <button
                type="submit"
                disabled={isSending || !content.trim()}
                className="w-10 h-10 rounded-full bg-[#D35400] text-white flex items-center justify-center disabled:opacity-40"
                aria-label="Envoyer"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          ) : (
            <Link
              href={loginUrl('/feed')}
              className="block w-full py-2.5 rounded-full bg-[#D35400] text-white text-sm font-bold text-center"
            >
              Midira hanoratra hevitra (Se connecter pour commenter)
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
