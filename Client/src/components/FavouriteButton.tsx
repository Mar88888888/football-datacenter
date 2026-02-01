import React from 'react';

interface HeartIconProps {
  filled: boolean;
}

const HeartIcon: React.FC<HeartIconProps> = ({ filled }) => {
  if (filled) {
    return (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="h-6 w-6"
        viewBox="0 0 20 20"
        fill="currentColor"
      >
        <path
          fillRule="evenodd"
          d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z"
          clipRule="evenodd"
        />
      </svg>
    );
  }

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className="h-6 w-6"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
      />
    </svg>
  );
};

interface FavouriteButtonProps {
  isFavourite: boolean;
  onClick: () => void;
  loading: boolean;
}

const FavouriteButton: React.FC<FavouriteButtonProps> = ({ isFavourite, onClick, loading }) => {
  if (isFavourite) {
    return (
      <button
        onClick={onClick}
        disabled={loading}
        className="p-3 bg-red-500/20 text-red-400 border border-red-500/30 rounded-xl hover:bg-red-500/30 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        title="Remove from favourites"
      >
        <HeartIcon filled />
      </button>
    );
  }

  return (
    <button
      onClick={onClick}
      disabled={loading}
      className="p-3 bg-slate-700 text-slate-300 border border-slate-600 rounded-xl hover:bg-slate-600 hover:text-white transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
      title="Add to favourites"
    >
      <HeartIcon filled={false} />
    </button>
  );
};

export default FavouriteButton;
