/** @format */

"use client";

import { ModelDetail } from "@/app/types";
import { updateModelField } from "@/lib/actions";
import { verifyAdminSession } from "@/lib/client-actions";
import { useState } from "react";
import toast from "react-hot-toast";
import { FaPen } from "react-icons/fa";

interface EditableLinkProps {
  value?: string;
  field: keyof ModelDetail;
  model: ModelDetail;
  icon: React.ReactNode;
  onEditAttempt: () => void;
  updateModel: (model: ModelDetail, field: keyof ModelDetail, value: string | string[]) => void;
}

export default function EditableLink({ value, field, model, icon, onEditAttempt, updateModel }: EditableLinkProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(value || "");
  const [hasChanges, setHasChanges] = useState(false);

  const handleEditClick = async () => {
    const isAuthenticated = await verifyAdminSession();
    if (!isAuthenticated) {
      onEditAttempt();
      return;
    }
    setIsEditing(true);
  };

  const handleSave = async () => {
    if (!hasChanges) {
      setIsEditing(false);
      return;
    }

    try {
      const newModel = await updateModelField(model.id, field, editValue);
      updateModel(newModel, field, editValue);
      setIsEditing(false);
      setHasChanges(false);
    } catch {
      toast.error("수정에 실패했습니다.");
    }
  };

  const handleChange = (value: string) => {
    setEditValue(value);
    setHasChanges(value !== editValue);
  };

  if (isEditing) {
    return (
      <div className="flex items-center gap-2">
        <input
          type="text"
          value={editValue}
          onChange={(e) => handleChange(e.target.value)}
          className="border rounded px-2 py-1 text-sm w-full"
          placeholder="URL을 입력하세요"
          autoFocus
          onBlur={handleSave}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleSave();
            if (e.key === "Escape") setIsEditing(false);
          }}
        />
      </div>
    );
  }

  return (
    <div className="group flex items-center gap-2">
      {value ? (
        <a href={value} target="_blank" rel="noopener noreferrer" className="text-2xl hover:opacity-70 transition-opacity">
          {icon}
        </a>
      ) : (
        <span className="text-2xl text-gray-300">{icon}</span>
      )}
      <button onClick={handleEditClick} className="invisible opacity-0 group-hover:opacity-100 transition-opacity md:visible">
        <FaPen className="w-3 h-3 text-gray-500 hover:text-gray-700" />
      </button>
    </div>
  );
}
