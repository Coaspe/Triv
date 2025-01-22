/** @format */

"use client";

import { ModelDetail } from "@/app/types";
import { updateModelField } from "@/lib/actions";
import { verifyAdminSession } from "@/lib/client-actions";
import { useState } from "react";
import { FaPen } from "react-icons/fa";

interface EditableFieldProps {
  value: string;
  field: keyof ModelDetail;
  model: ModelDetail;
  className?: string;
  onEditAttempt: () => void;
  updateModel: (model: ModelDetail, field: keyof ModelDetail, value: string | string[]) => void;
}

export default function EditableField({ value, field, model, className = "", onEditAttempt, updateModel }: EditableFieldProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(value);
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
      const newModel = await updateModelField(model, field, editValue);
      updateModel(newModel, field, editValue);
      setIsEditing(false);
      setHasChanges(false);
    } catch (error) {
      console.error("Failed to update field:", error);
      alert("수정에 실패했습니다.");
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
          className="border rounded px-2 py-1"
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
      <span className={className}>{value}</span>
      <button onClick={handleEditClick} className="opacity-0 group-hover:opacity-100 transition-opacity">
        <FaPen className="w-3 h-3 text-gray-500 hover:text-gray-700" />
      </button>
    </div>
  );
}
