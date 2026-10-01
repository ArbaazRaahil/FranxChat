import React, { useState, useRef, useEffect } from 'react';
import { usePosts } from '../../context/PostContext';
import { useAuth } from '../../context/AuthContext';
import { Avatar } from '../ui/Avatar';
import { X, Send, Heart } from 'lucide-react';

export const CommentDrawer: React.FC = () => {
  const { posts, comments, activeCommentPostId, closeCommentsDrawer, addComment } = usePosts();
  const { user, openAuthModal } = useAuth();
  const [inputText, setInputText] = useState('');
  const commentsEndRef = useRef<HTMLDivElement | null>(null);

  const activePost = posts.find((p) => p.id === activeCommentPostId);
  const activeComments = activeCommentPostId ? comments[activeCommentPostId] || [] : [];

  useEffect(() => {
    if (activeCommentPostId) {
      setTimeout(() => {
        commentsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    }
  }, [activeCommentPostId, activeComments.length]);

  if (!activeCommentPostId || !activePost) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      openAuthModal('login');
      return;
    }
    if (!inputText.trim()) return;
    addComment(activeCommentPostId, inputText.trim());
    setInputText('');
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:justify-end bg-black/60 backdrop-blur-xs transition-opacity"
      onClick={closeCommentsDrawer}
    >
      <div
        className="w-full sm:w-[420px] h-[80vh] sm:h-full bg-white dark:bg-zinc-950 sm:border-l border-slate-200 dark:border-zinc-800 rounded-t-3xl sm:rounded-none shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-bottom sm:slide-in-from-right duration-250"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Mobile Drag Handle Indicator */}
        <div className="w-10 h-1.5 bg-slate-300 dark:bg-zinc-700 rounded-full mx-auto my-2 sm:hidden" />

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-100 dark:border-zinc-800">
          <div>
            <h3 className="text-base font-semibold text-slate-900 dark:text-zinc-100">Comments</h3>
            <p className="text-xs text-slate-400 dark:text-zinc-500 tabular-nums">
              {activeComments.length} conversations
            </p>
          </div>
          <button
            onClick={closeCommentsDrawer}
            className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200 hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors"
            aria-label="Close comments"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Post Caption Preview */}
        <div className="px-5 py-3 bg-slate-50 dark:bg-zinc-900/40 border-b border-slate-100 dark:border-zinc-800/60 flex items-start gap-3">
          <Avatar src={activePost.user.avatarUrl} alt={activePost.user.fullName} size="sm" />
          <div className="text-xs leading-relaxed flex-1">
            <span className="font-semibold text-slate-900 dark:text-white mr-1.5">
              {activePost.user.username}
            </span>
            <span className="text-slate-600 dark:text-zinc-300">{activePost.caption}</span>
          </div>
        </div>

        {/* Virtualized/Scrollable Comment Stream */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
          {activeComments.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center text-slate-400 dark:text-zinc-500 py-10">
              <p className="text-sm font-medium">No comments yet</p>
              <p className="text-xs mt-1">Be the first to share your thoughts!</p>
            </div>
          ) : (
            activeComments.map((cmt) => (
              <div key={cmt.id} className="flex items-start gap-3 group">
                <Avatar src={cmt.user.avatarUrl} alt={cmt.user.fullName} size="sm" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-xs font-semibold text-slate-900 dark:text-zinc-200">
                      {cmt.user.username}
                    </span>
                    <span className="text-[11px] text-slate-400 dark:text-zinc-500">
                      {cmt.createdAt}
                    </span>
                  </div>
                  <p className="text-xs text-slate-700 dark:text-zinc-300 break-words leading-relaxed">
                    {cmt.content}
                  </p>
                </div>
                <button
                  className="p-1 text-slate-400 hover:text-rose-500 dark:hover:text-rose-400 transition-colors shrink-0"
                  aria-label="Like comment"
                >
                  <Heart className="w-3.5 h-3.5" />
                  {cmt.likesCount > 0 && (
                    <span className="text-[10px] block text-center mt-0.5 tabular-nums">
                      {cmt.likesCount}
                    </span>
                  )}
                </button>
              </div>
            ))
          )}
          <div ref={commentsEndRef} />
        </div>

        {/* Input Footer */}
        <form
          onSubmit={handleSubmit}
          className="p-3 border-t border-slate-100 dark:border-zinc-800 bg-white dark:bg-zinc-950 flex items-center gap-2"
        >
          <Avatar
            src={user?.avatarUrl}
            alt={user?.fullName || 'Guest'}
            size="sm"
            className="shrink-0"
          />
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder={user ? 'Add a comment...' : 'Sign in to comment...'}
            className="flex-1 h-10 px-3.5 rounded-full border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-900 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-rose-500"
          />
          <button
            type="submit"
            disabled={!inputText.trim()}
            className="w-10 h-10 rounded-full flex items-center justify-center bg-rose-500 hover:bg-rose-600 disabled:bg-slate-200 dark:disabled:bg-zinc-800 text-white disabled:text-slate-400 transition-colors"
            aria-label="Post comment"
          >
            <Send className="w-4 h-4 ml-0.5" />
          </button>
        </form>
      </div>
    </div>
  );
};
