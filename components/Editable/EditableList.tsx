/** @format */

"use client";

import { ModelDetail } from "@/app/types";
import { updateModelField } from "@/lib/actions";
import { verifyAdminSession } from "@/lib/client-actions";
import { useState } from "react";
import { FaPen, FaSave } from "react-icons/fa";

interface EditableListProps {
  values: string[];
  field: keyof ModelDetail;
  model: ModelDetail;
  title: string;
  onEditAttempt: () => void;
  updateModel: (model: ModelDetail, field: keyof ModelDetail, value: string | string[]) => void;
}

export default function EditableList({ values, field, model, title, onEditAttempt, updateModel }: EditableListProps) {
  const [items, setItems] = useState(values);
  const [isEditing, setIsEditing] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  const handleEditClick = async () => {
    const isAuthenticated = await verifyAdminSession();
    if (!isAuthenticated) {
      onEditAttempt();
      return;
    }
    setIsEditing(true);
  };

  const handleSave = async (newItems: string[]) => {
    try {
      const newModel = await updateModelField(model.id, field, newItems);
      updateModel(newModel, field, newItems);
      setItems(newItems);
      setHasChanges(false);
    } catch (error) {
      console.error("Failed to update field:", error);
      alert("수정에 실패했습니다.");
    }
  };

  const handleItemChange = (index: number, value: string) => {
    const newItems = [...items];
    newItems[index] = value;
    setItems(newItems);
    setHasChanges(true);
  };

  const handleItemDelete = async (index: number) => {
    const newItems = items.filter((_, i) => i !== index);
    setItems(newItems);
    setHasChanges(true);
    await handleSave(newItems);
  };

  const handleAddItem = async () => {
    const newItems = [...items, ""];
    setItems(newItems);
    setHasChanges(true);
    await handleSave(newItems);
  };

  const handleFinishEditing = async () => {
    if (hasChanges) {
      await handleSave(items);
    }
    setIsEditing(false);
  };

  if (!isEditing) {
    return (
      <div className="group mb-8">
        <div className="flex flex-col gap-2">
          <h2 className="text-2xl font-semibold mb-4 border-b border-gray-600 pb-2 w-full">
            <div className="flex items-center gap-2">
              {title}
              <button onClick={handleEditClick} className="opacity-0 group-hover:opacity-100 transition-opacity">
                <FaPen className="w-3 h-3 text-gray-500 hover:text-gray-700" />
              </button>
            </div>
          </h2>
        </div>
        <ul className="space-y-2">
          {items.map((item, index) => (
            <li key={index} className="text-sm text-black">
              {item}
            </li>
          ))}
        </ul>
      </div>
    );
  }

  return (
    <div className="mb-8">
      <div className="flex flex-col mb-4">
        <h2 className="text-2xl font-semibold border-b border-gray-600 pb-2 w-full flex items-center justify-between">
          {title}
          <button onClick={handleFinishEditing} className="p-2 hover:bg-gray-100 rounded-full transition-colors" title="저장">
            <FaSave className={`w-4 h-4 ${hasChanges ? "text-blue-600 hover:text-blue-800" : "text-gray-400"}`} />
          </button>
        </h2>
      </div>
      <div className="space-y-2">
        {items.map((item, index) => (
          <div key={index} className="flex items-center gap-2">
            <input type="text" value={item} onChange={(e) => handleItemChange(index, e.target.value)} className="flex-1 border rounded px-2 py-1" onBlur={() => handleSave(items)} />
            <button onClick={() => handleItemDelete(index)} className="p-1 text-red-500 hover:text-red-700">
              ✕
            </button>
          </div>
        ))}
        <button onClick={handleAddItem} className="w-full mt-2 px-3 py-2 bg-gray-100 text-gray-600 rounded border border-dashed border-gray-300 hover:bg-gray-200">
          + 항목 추가
        </button>
      </div>
    </div>
  );
}
