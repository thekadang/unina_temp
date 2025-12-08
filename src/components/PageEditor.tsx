import { useState } from 'react';
import { Edit3, Trash2, Copy, Plus, GripVertical, Save, X } from 'lucide-react';
import { Button } from './ui/button';

interface PageEditorProps {
  onEdit: () => void;
  onDuplicate: () => void;
  onDelete: () => void;
  canDelete: boolean;
  pageTitle: string;
}

export function PageEditor({ onEdit, onDuplicate, onDelete, canDelete, pageTitle }: PageEditorProps) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div 
      className="absolute top-4 right-4 print:hidden z-50"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {isHovered ? (
        <div className="flex gap-2 bg-white rounded-lg shadow-lg p-2 border border-gray-200">
          <Button
            variant="ghost"
            size="sm"
            onClick={onEdit}
            className="hover:bg-cyan-50"
          >
            <Edit3 className="w-4 h-4 text-cyan-600" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={onDuplicate}
            className="hover:bg-blue-50"
          >
            <Copy className="w-4 h-4 text-blue-600" />
          </Button>
          {canDelete && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onDelete}
              className="hover:bg-red-50"
            >
              <Trash2 className="w-4 h-4 text-red-600" />
            </Button>
          )}
        </div>
      ) : (
        <div className="bg-cyan-600 text-white rounded-full p-2 shadow-lg cursor-pointer hover:bg-cyan-700">
          <GripVertical className="w-4 h-4" />
        </div>
      )}
    </div>
  );
}

interface EditModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

export function EditModal({ isOpen, onClose, title, children }: EditModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center p-4 print:hidden">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-gray-900">{title}</h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="hover:bg-gray-100"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>
        <div className="flex-1 overflow-y-auto p-6">
          {children}
        </div>
        <div className="flex justify-end gap-3 p-6 border-t border-gray-200">
          <Button variant="outline" onClick={onClose}>
            취소
          </Button>
          <Button onClick={onClose} className="bg-cyan-600 hover:bg-cyan-700 text-white">
            <Save className="w-4 h-4 mr-2" />
            저장
          </Button>
        </div>
      </div>
    </div>
  );
}
