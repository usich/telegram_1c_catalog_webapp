import React from 'react';
import { Folder } from 'lucide-react';
import { FolderItem as IFolderItem } from '../types';

interface Props {
  item: IFolderItem;
  onClick: (item: IFolderItem) => void;
}

export const FolderItem: React.FC<Props> = ({ item, onClick }) => {
  return (
    <div 
      onClick={() => onClick(item)}
      className="flex items-center p-4 bg-tg-secondary rounded-xl mb-2 cursor-pointer active:opacity-70 transition-opacity"
    >
      <Folder className="w-6 h-6 text-tg-button mr-4" />
      <span className="flex-1 font-medium text-tg-text text-lg">{item.name}</span>
      <svg className="w-5 h-5 text-tg-hint" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
      </svg>
    </div>
  );
};