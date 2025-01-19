"use client";

import { ModelDetails, SignedImageUrls } from "@/app/types";
import Image from "next/image";
import { Suspense, useEffect, useState } from "react";
import { FaInstagram, FaPen, FaSave, FaTiktok, FaUserCircle, FaYoutube } from "react-icons/fa";
import { getModelDetail, updateModelField, updateModelImages, uploadImages } from "@/lib/actions";
import { DragDropContext, Draggable, Droppable } from "@hello-pangea/dnd";
import { verifyAdminSession } from "@/lib/client-actions";
import { compressImages } from "@/lib/imageUtils";
import { nanoid } from "nanoid";
import { useModelStore } from "@/lib/store/modelStore";
import ModelDetailSkeleton from "@/components/ModelDetailSkeleton";

interface EditableFieldProps {
  value: string;
  field: keyof ModelDetails;
  modelId: string;
  className?: string;
  onEditAttempt: () => void;
}

function EditableField({ value, field, modelId, className = "", onEditAttempt }: EditableFieldProps) {
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
      await updateModelField(modelId, field, editValue);
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

interface EditableLinkProps {
  value?: string;
  field: keyof ModelDetails;
  modelId: string;
  icon: React.ReactNode;
  onEditAttempt: () => void;
}

function EditableLink({ value, field, modelId, icon, onEditAttempt }: EditableLinkProps) {
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
      await updateModelField(modelId, field, editValue);
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
      <button onClick={handleEditClick} className="opacity-0 group-hover:opacity-100 transition-opacity">
        <FaPen className="w-3 h-3 text-gray-500 hover:text-gray-700" />
      </button>
    </div>
  );
}

interface EditableListProps {
  values: string[];
  field: keyof ModelDetails;
  modelId: string;
  title: string;
  onEditAttempt: () => void;
}

function EditableList({ values, field, modelId, title, onEditAttempt }: EditableListProps) {
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
      await updateModelField(modelId, field, newItems);
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

function ImageManager({ model, setModelData, onEditAttempt }: { model: ModelDetails; setModelData: (model: ModelDetails) => void; onEditAttempt: () => void }) {
  const [isEditing, setIsEditing] = useState(false);

  const handleEditClick = async () => {
    const isAuthenticated = await verifyAdminSession();
    if (!isAuthenticated) {
      onEditAttempt();
      return;
    }
    setIsEditing(true);
  };

  return (
    <div className="relative group">
      {/* 메인 이미지 */}
      {model.images && model.signedImageUrls?.[model.images[0]] ? (
        <div className="relative aspect-[3/4] overflow-hidden shadow-md">
          <Image src={model.signedImageUrls[model.images[0]].url} alt="Profile" fill style={{ objectFit: "cover" }} priority />
          {/* 편집 버튼 */}
          <button
            onClick={handleEditClick}
            className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 
          transition-opacity bg-black bg-opacity-50 text-white p-2 rounded-full"
          >
            <FaPen className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <div className="relative group aspect-[3/4] bg-gray-100 flex items-center justify-center">
          <FaUserCircle className="w-20 h-20 text-gray-400" />
          <button
            onClick={() => setIsEditing(true)}
            className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 
        transition-opacity bg-black bg-opacity-50 text-white p-2 rounded-full"
          >
            <FaPen className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* 이미지 관리 모달 */}
      {isEditing && <ImageEditModal model={model} setModelData={setModelData} onClose={() => setIsEditing(false)} />}
    </div>
  );
}

function ImageEditModal({ model, onClose, setModelData }: { model: ModelDetails; onClose: () => void; setModelData: (model: ModelDetails) => void }) {
  const [imageList, setImageList] = useState(model.images || []);
  const [hasChanges, setHasChanges] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [pendingUploads, setPendingUploads] = useState<File[]>([]);
  const [signedImageUrls, setSignedImageUrls] = useState(model.signedImageUrls || {});

  const handleDragEnd = (result: any) => {
    if (!result.destination) return;

    const items = Array.from(imageList);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    setImageList(items);
    setHasChanges(true);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.length) return;

    try {
      // 파일 압축
      const compressedFiles: File[] = await compressImages(Array.from(e.target.files));

      // 압축된 파일들의 임시 URL 생성
      const tempUrls = compressedFiles.map((file) => URL.createObjectURL(file));
      const now = Date.now();
      setPendingUploads((prev) => [...prev, ...compressedFiles]);
      setImageList((prev) => {
        for (const url of tempUrls) {
          signedImageUrls[url] = { url, expires: now };
        }
        return [...prev, ...tempUrls];
      });
      setSignedImageUrls(signedImageUrls);
      setHasChanges(true);

      // 파일 크기 로깅 (선택사항)
      compressedFiles.forEach((file, i) => {
        const originalSize = e.target.files![i].size / 1024 / 1024;
        const compressedSize = file.size / 1024 / 1024;
        console.log(`File ${i + 1}: ${originalSize.toFixed(2)}MB -> ${compressedSize.toFixed(2)}MB`);
      });
    } catch (error) {
      console.error("Failed to process images:", error);
      alert("이미지 처리 중 오류가 발생했습니다.");
    }
  };

  const handleImageDelete = (index: number) => {
    if (!confirm("이미지를 삭제하시겠습니까?")) return;

    const newList = imageList.filter((_, i) => i !== index);
    setImageList(newList);
    setHasChanges(true);
  };

  const handleClose = async (shouldSave: boolean) => {
    if (shouldSave && hasChanges) {
      try {
        if (pendingUploads.length > 0) {
          const fileList = new DataTransfer();

          // Blob을 File로 변환하고 유니크한 이름 부여
          pendingUploads.forEach((blob) => {
            // 파일 타입과 확장자 처리
            const fileType = blob.type || "image/jpeg";
            const extension = fileType.split("/")[1] || "jpeg";

            // 유니크한 파일명 생성
            const uniqueId = nanoid();
            const fileName = `${uniqueId}.${extension}`;

            // Blob을 File로 변환
            const file = new File([blob], fileName, {
              type: fileType,
              lastModified: new Date().getTime(),
            });

            fileList.items.add(file);
          });

          const uploadedImages = await uploadImages(model.id, fileList.files);

          const finalImageList = imageList.map((img) => {
            if (img.startsWith("blob:")) {
              return uploadedImages.shift() || img;
            }
            return img;
          });

          await updateModelImages(model.id, finalImageList);
        } else {
          await updateModelImages(model.id, imageList);
        }

        const newSignedImageUrls: SignedImageUrls = {};
        const now = Date.now();
        imageList.forEach((img) => {
          newSignedImageUrls[img] = { url: signedImageUrls[img].url, expires: now };
        });

        setModelData({ ...model, images: imageList, signedImageUrls: newSignedImageUrls });
        onClose();
      } catch (error) {
        console.error("Failed to update images:", error);
        alert("변경사항 저장에 실패했습니다.");
      }
    } else {
      imageList.forEach((url) => {
        if (url.startsWith("blob:")) {
          URL.revokeObjectURL(url);
        }
      });
      onClose();
    }
  };

  const handleCloseClick = () => {
    if (hasChanges) {
      setShowConfirmDialog(true);
    } else {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
      <div className="bg-white rounded-lg p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">이미지 관리</h2>
          <button onClick={handleCloseClick} className="text-gray-500 hover:text-gray-700">
            ✕
          </button>
        </div>

        {/* 저장 확인 다이얼로그 */}
        {showConfirmDialog && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
            <div className="bg-white rounded-lg p-6 max-w-md w-full">
              <h3 className="text-lg font-semibold mb-4">변경사항이 있습니다</h3>
              <p className="text-gray-600 mb-6">변경사항을 저장하시겠습니까?</p>
              <div className="flex justify-end gap-3">
                <button onClick={() => handleClose(false)} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded">
                  저장하지 않고 닫기
                </button>
                <button onClick={() => handleClose(true)} className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
                  저장하고 닫기
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 이미지 업로드 */}
        <div className="mb-6">
          <input type="file" multiple accept="image/*" onChange={handleImageUpload} className="hidden" id="image-upload" />
          <label
            htmlFor="image-upload"
            className="block w-full py-3 text-center border-2 border-dashed 
            border-gray-300 rounded cursor-pointer hover:bg-gray-50"
          >
            + 새 이미지 추가
          </label>
        </div>

        {/* 이미지 그리드 */}
        <DragDropContext onDragEnd={handleDragEnd}>
          <Droppable droppableId="images" direction="horizontal">
            {(provided) => (
              <div
                {...provided.droppableProps}
                ref={provided.innerRef}
                className="grid grid-cols-2 md:grid-cols-4 gap-4"
                style={{
                  display: "grid",
                  gridAutoFlow: "row dense",
                }}
              >
                {imageList.map((image, index) => (
                  <Draggable key={image} draggableId={image} index={index}>
                    {(provided, snapshot) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                        style={{
                          ...provided.draggableProps.style,
                          width: snapshot.isDragging ? "200px" : "100%",
                          height: snapshot.isDragging ? "266px" : "100%",
                          transform: provided.draggableProps.style?.transform,
                          gridRow: "auto",
                        }}
                      >
                        <div className={`relative aspect-[3/4] ${snapshot.isDragging ? "z-50" : ""}`}>
                          <div className="absolute inset-0 bg-white rounded overflow-hidden">
                            <Image src={signedImageUrls[image].url} alt={`Image ${index + 1}`} fill className="object-cover" />
                            <div
                              className="absolute inset-0 bg-black bg-opacity-0 
                              group-hover:bg-opacity-30 transition-opacity"
                            >
                              <button
                                onClick={() => handleImageDelete(index)}
                                className="absolute top-2 right-2 text-white 
                                opacity-0 group-hover:opacity-100 transition-opacity"
                              >
                                ✕
                              </button>
                            </div>
                            {index === 0 && (
                              <div
                                className="absolute top-2 left-2 bg-blue-500 
                              text-white text-xs px-2 py-1 rounded"
                              >
                                프로필
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>
      </div>
    </div>
  );
}

function AdminAuthModal({ onAuth, onClose }: { onAuth: () => void; onClose: () => void }) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  async function setAdminSession(password: string) {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/auth`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ password }),
        credentials: "include", // 이 옵션 추가
      });

      if (!response.ok) {
        throw new Error("Authentication failed");
      }

      return await response.json();
    } catch (error) {
      console.error("Failed to set admin session:", error);
      throw error;
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await setAdminSession(password);
      console.log(response, "response");
      if (response) {
        onAuth();
      } else {
        setError("잘못된 비밀번호입니다.");
      }
    } catch (error) {
      setError("인증 과정에서 오류가 발생했습니다.");
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
      <div className="bg-white rounded-lg p-6 max-w-md w-full">
        <h2 className="text-xl font-bold mb-4">관리자 인증</h2>
        <form onSubmit={handleSubmit}>
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full border rounded px-3 py-2 mb-4" placeholder="비밀번호를 입력하세요" />
          {error && <p className="text-red-500 mb-4">{error}</p>}
          <div className="flex justify-end gap-3">
            <button type="button" onClick={onClose} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded">
              취소
            </button>
            <button type="submit" className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
              확인
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function ModelDetailClient({ id }: { id: string }) {
  const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [modelData, setModelData] = useState<ModelDetails>();
  const images_length = modelData?.images ? modelData.images.length : 0;
  const { setModel, setSignedUrls, getModel, getSignedUrls } = useModelStore();

  const getAndSetModelData = async () => {
    if (!id) return;
    const model = await getModelDetail(id, getModel(id), getSignedUrls(id));
    console.log(getSignedUrls(id), "model");
    setAllModelData(model);
    setSignedUrls(model.signedImageUrls);
  };

  useEffect(() => {
    getAndSetModelData();
  }, [id]);

  const handleEditAttempt = async () => {
    const isAuthenticated = await verifyAdminSession();

    if (!isAuthenticated) {
      setShowAuthModal(true);
    }
  };
  const setAllModelData = (model: ModelDetails) => {
    setModel(model);
    setModelData(model);
  };

  const handleImageClick = (index: number) => {
    setSelectedImageIndex(index);
    setShowModal(true);
  };

  return (
    <Suspense fallback={<ModelDetailSkeleton />}>
      {modelData && (
        <div className="max-w-[1200px] mx-auto px-6 pb-6 text-black rounded-lg">
          {showAuthModal && (
            <AdminAuthModal
              onAuth={() => {
                setShowAuthModal(false);
              }}
              onClose={() => setShowAuthModal(false)}
            />
          )}

          {/* 메인 섹션 */}
          <div className="flex flex-col md:flex-row gap-12 mb-16">
            {/* 메인 이미지 */}
            <div className="md:w-1/2">
              <ImageManager model={modelData} setModelData={setAllModelData} onEditAttempt={handleEditAttempt} />
            </div>

            {/* 모델 정보 */}
            <div className="md:w-1/2 ml-5">
              <h1 className="text-4xl font-bold mb-6">
                <EditableField value={modelData.displayName} field="displayName" modelId={modelData.id} className="text-4xl font-bold" onEditAttempt={handleEditAttempt} />
              </h1>

              {/* 소셜 미디어 링크 */}
              <div className="flex gap-4 mb-6">
                <EditableLink value={modelData.instagram} field="instagram" modelId={modelData.id} icon={<FaInstagram />} onEditAttempt={handleEditAttempt} />
                <EditableLink value={modelData.tiktok} field="tiktok" modelId={modelData.id} icon={<FaTiktok />} onEditAttempt={handleEditAttempt} />
                <EditableLink value={modelData.youtube} field="youtube" modelId={modelData.id} icon={<FaYoutube />} onEditAttempt={handleEditAttempt} />
              </div>

              <div className="space-y-2 mb-8 text-lg">
                {modelData.height && (
                  <p>
                    <span className="font-semibold">Height:</span> <EditableField value={modelData.height} field="height" modelId={modelData.id} onEditAttempt={handleEditAttempt} />
                  </p>
                )}
                {modelData.weight && (
                  <p>
                    <span className="font-semibold">Weight:</span> <EditableField value={modelData.weight} field="weight" modelId={modelData.id} onEditAttempt={handleEditAttempt} />
                  </p>
                )}
                {modelData.size && (
                  <p>
                    <span className="font-semibold">Size:</span> <EditableField value={modelData.size} field="size" modelId={modelData.id} onEditAttempt={handleEditAttempt} />
                  </p>
                )}
              </div>
              {modelData.modelingInfo && <EditableList values={modelData.modelingInfo} field="modelingInfo" modelId={modelData.id} title="Experience" onEditAttempt={handleEditAttempt} />}
            </div>
          </div>

          {/* 추가 이미지 그리드 */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {modelData.images &&
              modelData.images?.length > 1 &&
              modelData.images.slice(1).map((image, index) =>
                modelData.signedImageUrls ? (
                  <div key={index} className="flex flex-col items-center cursor-pointer relative aspect-[3/4] rounded-lg overflow-hidden shadow-md hover:scale-105 transition-transform duration-300">
                    <div className="relative w-full aspect-[3/4]" onClick={() => handleImageClick(index + 1)}>
                      <Image src={modelData.signedImageUrls[image].url} alt={`${modelData.name} ${index + 2}`} fill className="object-cover" sizes="(max-width: 768px) 50vw, 25vw" />
                    </div>
                    <h2 className="mt-2 text-center text-sm font-medium">{`${modelData.name} ${index + 2}`}</h2>
                  </div>
                ) : (
                  <></>
                )
              )}
          </div>

          {/* 이미지 모달 */}
          {showModal && selectedImageIndex !== null && (
            <div className="fixed inset-0 bg-black bg-opacity-75 z-50 flex items-center justify-center">
              {/* 닫기 버튼 */}
              <button className="absolute top-4 right-4 text-white text-xl p-2" onClick={() => setShowModal(false)}>
                ✕
              </button>
              {/* 이전 버튼 */}
              {modelData.images && modelData.images.length > 1 && (
                <button className="absolute left-4 text-white text-4xl p-4" onClick={() => setSelectedImageIndex((prev) => (prev !== null ? (prev > 0 ? prev - 1 : images_length - 1) : null))}>
                  ‹
                </button>
              )}

              {/* 이미지 */}
              {modelData.images && modelData.images.length > 1 && (
                <div className="relative h-[80vh] w-[800px] max-w-[90vw]">
                  <Image
                    src={modelData.signedImageUrls && modelData.images ? modelData.signedImageUrls[modelData.images[selectedImageIndex]].url : ""}
                    alt={`${modelData.name} ${selectedImageIndex + 1}`}
                    fill
                    style={{
                      objectFit: "contain",
                      objectPosition: "center center",
                    }}
                    priority
                  />
                </div>
              )}

              {/* 다음 버튼 */}
              {modelData.images && modelData.images.length > 1 && (
                <button className="absolute right-4 text-white text-4xl p-4" onClick={() => setSelectedImageIndex((prev) => (prev !== null ? (prev < images_length - 1 ? prev + 1 : 0) : null))}>
                  ›
                </button>
              )}

              {/* 현재 이미지 번호 표시 */}
              {modelData.images && modelData.images.length > 1 && (
                <div className="absolute bottom-4 text-white">
                  {selectedImageIndex + 1} / {modelData.images.length}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </Suspense>
  );
}
