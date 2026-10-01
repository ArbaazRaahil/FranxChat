import React, { useState, useRef } from 'react';
import { usePosts } from '../../context/PostContext';
import { useAuth } from '../../context/AuthContext';
import { Modal } from '../ui/Modal';
import { UploadCloud, Image, Film, Plus, X, Music, Sparkles } from 'lucide-react';
import { PostType } from '../../types';

export const MediaUploadWizard: React.FC = () => {
  const { isUploadWizardOpen, closeUploadWizard, uploadWizardDefaultType, createPost } = usePosts();
  const { user, openAuthModal } = useAuth();

  const [postType, setPostType] = useState<PostType>(uploadWizardDefaultType);
  const [mediaUrl, setMediaUrl] = useState('');
  const [caption, setCaption] = useState('');
  const [tags, setTags] = useState<string[]>(['creative', 'spotlight']);
  const [currentTagInput, setCurrentTagInput] = useState('');
  const [audioTitle, setAudioTitle] = useState('');
  const [audioArtist, setAudioArtist] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleFileChange = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target?.result) {
        setMediaUrl(e.target.result as string);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileChange(e.dataTransfer.files[0]);
    }
  };

  const handleAddTag = () => {
    const clean = currentTagInput.trim().replace(/^#/, '').toLowerCase();
    if (clean && !tags.includes(clean)) {
      setTags([...tags, clean]);
      setCurrentTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter((t) => t !== tagToRemove));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      openAuthModal('login');
      return;
    }
    if (!mediaUrl.trim()) return;

    setIsSubmitting(true);
    try {
      await createPost({
        type: postType,
        mediaUrl: mediaUrl.trim(),
        caption: caption.trim(),
        tags,
        audioTrackTitle: audioTitle.trim() || (postType === 'spotlight_reel' ? 'Original Audio' : undefined),
        audioTrackArtist: audioArtist.trim() || (postType === 'spotlight_reel' ? user.fullName : undefined),
        aspectRatio: postType === 'spotlight_reel' ? '9:16' : '1:1',
      });
      // reset
      setMediaUrl('');
      setCaption('');
      setTags(['creative', 'spotlight']);
      setAudioTitle('');
      setAudioArtist('');
      closeUploadWizard();
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isUploadWizardOpen}
      onClose={closeUploadWizard}
      title="Create New Spotlight Post"
      maxWidth="max-w-xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Post Type Selector */}
        <div className="grid grid-cols-2 p-1 bg-slate-100 dark:bg-zinc-800 rounded-xl text-xs font-semibold">
          <button
            type="button"
            onClick={() => setPostType('standard')}
            className={`py-2 flex items-center justify-center gap-2 rounded-lg transition-all ${
              postType === 'standard'
                ? 'bg-white dark:bg-zinc-900 text-slate-900 dark:text-white shadow-sm'
                : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Image className="w-4 h-4" />
            Standard Post (1:1)
          </button>
          <button
            type="button"
            onClick={() => setPostType('spotlight_reel')}
            className={`py-2 flex items-center justify-center gap-2 rounded-lg transition-all ${
              postType === 'spotlight_reel'
                ? 'bg-white dark:bg-zinc-900 text-slate-900 dark:text-white shadow-sm'
                : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Film className="w-4 h-4 text-rose-500" />
            Vertical Spotlight (9:16)
          </button>
        </div>

        {/* Media Drag and Drop / URL Input */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1.5">
            Media Asset
          </label>

          {mediaUrl ? (
            <div className="relative rounded-2xl overflow-hidden border border-slate-200 dark:border-zinc-800 bg-black flex items-center justify-center max-h-64">
              {postType === 'spotlight_reel' && mediaUrl.endsWith('.mp4') ? (
                <video
                  src={mediaUrl}
                  controls
                  className="max-h-64 object-contain"
                />
              ) : (
                <img
                  src={mediaUrl}
                  alt="Upload preview"
                  className="max-h-64 object-contain"
                />
              )}
              <button
                type="button"
                onClick={() => setMediaUrl('')}
                className="absolute top-2 right-2 p-1.5 rounded-full bg-black/60 hover:bg-black text-white transition-colors"
                aria-label="Remove preview"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragging(true);
              }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-colors ${
                isDragging
                  ? 'border-rose-500 bg-rose-50/50 dark:bg-rose-950/20'
                  : 'border-slate-200 dark:border-zinc-800 hover:border-slate-300 dark:hover:border-zinc-700 bg-slate-50/50 dark:bg-zinc-900/50'
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*,video/*"
                className="hidden"
                onChange={(e) => {
                  if (e.target.files?.[0]) handleFileChange(e.target.files[0]);
                }}
              />
              <UploadCloud className="w-8 h-8 mx-auto text-slate-400 dark:text-zinc-500 mb-2" />
              <p className="text-xs font-medium text-slate-800 dark:text-zinc-200">
                Click to browse or drag and drop image/video
              </p>
              <p className="text-[11px] text-slate-400 dark:text-zinc-500 mt-1">
                PNG, JPG, MP4 or WEBM
              </p>
            </div>
          )}

          {/* Alternative URL Input */}
          <div className="mt-2 flex gap-2">
            <input
              type="url"
              value={mediaUrl.startsWith('data:') ? '' : mediaUrl}
              onChange={(e) => setMediaUrl(e.target.value)}
              placeholder="Or paste media URL (e.g. https://...)"
              className="flex-1 h-9 px-3 rounded-lg border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-rose-500"
            />
          </div>
        </div>

        {/* Caption */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1">
            Caption & Story
          </label>
          <textarea
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            rows={3}
            placeholder="Write a caption... share your process, feelings, or story."
            className="w-full p-3 rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-rose-500 resize-none leading-relaxed"
          />
        </div>

        {/* Inline Tag-Injector Chip Component */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1">
            Tags & Discoverability
          </label>
          <div className="flex flex-wrap gap-1.5 p-2 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-900/50 min-h-[42px] items-center">
            {tags.map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium bg-white dark:bg-zinc-800 text-slate-800 dark:text-zinc-200 shadow-2xs border border-slate-200/80 dark:border-zinc-700"
              >
                #{tag}
                <button
                  type="button"
                  onClick={() => handleRemoveTag(tag)}
                  className="hover:text-rose-500 transition-colors"
                  aria-label={`Remove tag ${tag}`}
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
            <div className="flex items-center gap-1 flex-1 min-w-[120px]">
              <input
                type="text"
                value={currentTagInput}
                onChange={(e) => setCurrentTagInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddTag();
                  }
                }}
                placeholder="Type tag & Enter"
                className="w-full bg-transparent text-xs text-slate-900 dark:text-white focus:outline-none pl-1"
              />
              <button
                type="button"
                onClick={handleAddTag}
                className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200"
                aria-label="Add tag"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* Optional Audio Metadata for Spotlights */}
        {postType === 'spotlight_reel' && (
          <div className="p-3 rounded-xl bg-violet-50/50 dark:bg-violet-950/20 border border-violet-100 dark:border-violet-900/40 space-y-2">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-violet-900 dark:text-violet-300">
              <Music className="w-3.5 h-3.5" />
              <span>Audio Track Attribution</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <input
                type="text"
                value={audioTitle}
                onChange={(e) => setAudioTitle(e.target.value)}
                placeholder="Track Title (e.g. Midnight Drift)"
                className="h-8 px-2.5 rounded-lg border border-violet-200 dark:border-violet-800 bg-white dark:bg-zinc-900 text-xs text-slate-900 dark:text-white focus:outline-none"
              />
              <input
                type="text"
                value={audioArtist}
                onChange={(e) => setAudioArtist(e.target.value)}
                placeholder="Artist Name (e.g. Maya Lin)"
                className="h-8 px-2.5 rounded-lg border border-violet-200 dark:border-violet-800 bg-white dark:bg-zinc-900 text-xs text-slate-900 dark:text-white focus:outline-none"
              />
            </div>
          </div>
        )}

        {/* Submit CTA */}
        <div className="pt-2 flex justify-end gap-2">
          <button
            type="button"
            onClick={closeUploadWizard}
            className="px-4 py-2 text-xs font-medium text-slate-600 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-800 rounded-xl transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={!mediaUrl.trim() || isSubmitting}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-rose-500 to-violet-600 hover:from-rose-600 hover:to-violet-700 text-white font-medium text-xs shadow-md shadow-rose-500/20 active:scale-[0.98] transition-transform disabled:opacity-50 flex items-center gap-2"
          >
            <Sparkles className="w-3.5 h-3.5" />
            {isSubmitting ? 'Publishing...' : 'Publish to Spotlight'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
