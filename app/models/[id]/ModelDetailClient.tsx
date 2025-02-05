/** @format */

"use client";

import { ModelDetail, SignedImageUrls } from "@/app/types";
import Image from "next/image";
import { useEffect, useState } from "react";
import { FaInstagram, FaPen, FaTiktok, FaUserCircle, FaYoutube } from "react-icons/fa";
import { getModelDetail, updateModelField } from "@/lib/actions";
import { DragDropContext, Draggable, Droppable } from "@hello-pangea/dnd";
import { verifyAdminSession } from "@/lib/client-actions";
import { compressImages } from "@/lib/imageUtils";
import { useModelStore } from "@/lib/store/modelStore";
import ModelDetailSkeleton from "@/components/ModelDetailSkeleton";
import EditableField from "@/components/Editable/EditableField";
import EditableLink from "@/components/Editable/EditableLink";
import EditableList from "@/components/Editable/EditableList";
import { decrypt } from "@/lib/encrypt";

// 이미지 관련 상수
const IMAGE_CONSTANTS = {
  ASPECT_RATIO: "3/4",
  THUMBNAIL_SIZE: {
    WIDTH: 200,
    HEIGHT: 266,
  },
  MODAL_MAX_WIDTH: "4xl",
  GRID_COLUMNS: {
    DEFAULT: 2,
    MD: 4,
  },
} as const;

// 모달 관련 상수
const MODAL_MESSAGES = {
  TITLE: "이미지 관리",
  SAVE_CONFIRM: "변경사항을 저장하시겠습니까?",
  CLOSE_WITHOUT_SAVE: "저장하지 않고 닫기",
  SAVE_AND_CLOSE: "저장하고 닫기",
  SAVING: "저장 중...",
  DELETE_CONFIRM: "이미지를 삭제하시겠습니까?",
  PROFILE_LABEL: "프로필",
  ADD_IMAGE: "새 이미지 추가",
  SAVE_ERROR: "변경사항 저장에 실패했습니다.",
  SAVE_CHANGES: "변경사항이 있습니다.",
} as const;

// 인증 관련 상수
const AUTH_MESSAGES = {
  TITLE: "관리자 인증",
  PASSWORD_PLACEHOLDER: "비밀번호를 입력하세요",
  INVALID_PASSWORD: "잘못된 비밀번호입니다.",
  AUTH_ERROR: "인증 과정에서 오류가 발생했습니다.",
  CANCEL: "취소",
  CONFIRM: "확인",
} as const;

// CSS 클래스 상수
const CSS_CLASSES = {
  IMAGE_CONTAINER: "relative aspect-[3/4] overflow-hidden shadow-md",
  EDIT_BUTTON: "absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity bg-black bg-opacity-50 text-white p-2 rounded-full",
  PLACEHOLDER: "relative group aspect-[3/4] bg-gray-100 flex items-center justify-center",
  MODAL_OVERLAY: "fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center",
} as const;

function ImageManager({
  model,
  onEditAttempt,
  setModel,
  signedUrls,
  setSignedUrls,
}: {
  model: ModelDetail;
  onEditAttempt: () => void;
  setModel: (model: ModelDetail) => void;
  signedUrls: SignedImageUrls;
  setSignedUrls: (signedUrls: SignedImageUrls) => void;
}) {
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
      {model.images && signedUrls?.[model.images[0]] ? (
        <div className={CSS_CLASSES.IMAGE_CONTAINER}>
          <Image src={`${signedUrls[model.images[0]].url}&format=webp&quality=80`} alt="Profile" fill style={{ objectFit: "cover" }} priority />
          <button onClick={handleEditClick} className={CSS_CLASSES.EDIT_BUTTON}>
            <FaPen className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <div className={CSS_CLASSES.PLACEHOLDER}>
          <FaUserCircle className="w-20 h-20 text-gray-400" />
          <button onClick={() => setIsEditing(true)} className={CSS_CLASSES.EDIT_BUTTON}>
            <FaPen className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* 이미지 관리 모달 */}
      {isEditing && <ImageEditModal model={model} onClose={() => setIsEditing(false)} setModel={setModel} signedUrls={signedUrls} setSignedUrls={setSignedUrls} />}
    </div>
  );
}

function ImageEditModal({
  model,
  onClose,
  setModel,
  signedUrls,
  setSignedUrls,
}: {
  model: ModelDetail;
  onClose: () => void;
  setModel: (model: ModelDetail) => void;
  signedUrls: SignedImageUrls;
  setSignedUrls: (signedUrls: SignedImageUrls) => void;
}) {
  const imageList = [...(model?.images || [])];
  const [nextImageList, setNextImageList] = useState<string[]>([...(model?.images || [])]);
  const [hasChanges, setHasChanges] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [pendingUploads, setPendingUploads] = useState<File[]>([]);
  const [signedImageUrls, setSignedImageUrls] = useState<SignedImageUrls>(JSON.parse(JSON.stringify(signedUrls)));
  const [isLoading, setIsLoading] = useState(false);

  const handleDragEnd = (result: any) => {
    if (!result.destination) return;

    const items = Array.from(nextImageList);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    setNextImageList(items);
    setHasChanges(true);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.length) return;

    try {
      const compressedFiles: File[] = await compressImages(Array.from(e.target.files));
      const now = Date.now();
      setPendingUploads((prev) => [...prev, ...compressedFiles]);
      setNextImageList((prev) => {
        const newImageList = [...prev];
        for (const file of compressedFiles) {
          signedImageUrls[file.name] = { url: URL.createObjectURL(file), expires: now };
          newImageList.push(file.name);
        }
        return newImageList;
      });
      setHasChanges(true);
    } catch (error) {
      console.error("Failed to process images:", error);
      alert("이미지 처리 중 오류가 발생했습니다.");
    }
  };

  const handleImageDelete = (index: number) => {
    if (!confirm("이미지를 삭제하시겠습니까?")) return;
    setNextImageList(nextImageList.filter((_, i) => i !== index));
    setHasChanges(true);
  };

  const handleClose = async (shouldSave: boolean) => {
    if (shouldSave && hasChanges) {
      setIsLoading(true);
      try {
        const formData = new FormData();

        formData.append("modelId", model.id);
        // 1. 파일 추가 (필드 이름은 'files', 복수 파일 지원을 위해 'files'로 통일하는 것이 일반적)
        pendingUploads.forEach((file) => {
          formData.append("newImages", file, file.name); // 'files' 필드에 각 파일 추가
        });

        const nextImageSet = new Set(nextImageList);
        const deletedImage = imageList.filter((image) => !nextImageSet.has(image));
        formData.append("deletedImages", JSON.stringify(deletedImage)); // 'stringArray' 필드에 JSON 문자열 추가
        formData.append("nextImageList", JSON.stringify(nextImageList));

        const response = await fetch("/api/model-detail-client", {
          // 실제 API 엔드포인트로 변경
          method: "POST",
          body: formData,
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.message || "저장에 실패했습니다.");
        }

        const data = (await response.json()) as { signedUrls: string; newModel: string };

        const decryptedSignedUrls = JSON.parse(decrypt(data.signedUrls)) as SignedImageUrls;
        const decryptedNewModel = JSON.parse(decrypt(data.newModel)) as ModelDetail;

        setModel(decryptedNewModel);
        setSignedUrls(decryptedSignedUrls);
        onClose();
      } catch (error: any) {
        alert(error.message || MODAL_MESSAGES.SAVE_ERROR);
      } finally {
        setIsLoading(false);
      }
    }

    nextImageList.forEach((url) => {
      if (url.startsWith("blob:")) {
        URL.revokeObjectURL(url);
      }
    });
    onClose();
  };

  const handleCloseClick = () => {
    if (hasChanges) {
      setShowConfirmDialog(true);
    } else {
      onClose();
    }
  };

  return (
    <div className={CSS_CLASSES.MODAL_OVERLAY}>
      <div className={`bg-white rounded-lg p-6 max-w-${IMAGE_CONSTANTS.MODAL_MAX_WIDTH} w-full max-h-[90vh] overflow-y-auto`}>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">{MODAL_MESSAGES.TITLE}</h2>
          <button onClick={handleCloseClick} className="text-gray-500 hover:text-gray-700">
            ✕
          </button>
        </div>

        {/* 저장 확인 다이얼로그 */}
        {showConfirmDialog && (
          <div className={CSS_CLASSES.MODAL_OVERLAY}>
            <div className="bg-white rounded-lg p-6 max-w-md w-full">
              <h3 className="text-lg font-semibold mb-4">{MODAL_MESSAGES.SAVE_CHANGES}</h3>
              <p className="text-gray-600 mb-6">{MODAL_MESSAGES.SAVE_CONFIRM}</p>
              <div className="flex justify-end gap-3">
                <button onClick={() => handleClose(false)} disabled={isLoading} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded disabled:opacity-50">
                  {MODAL_MESSAGES.CLOSE_WITHOUT_SAVE}
                </button>
                <button onClick={() => handleClose(true)} disabled={isLoading} className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50 flex items-center gap-2">
                  {isLoading ? (
                    <>
                      <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      {MODAL_MESSAGES.SAVING}
                    </>
                  ) : (
                    MODAL_MESSAGES.SAVE_AND_CLOSE
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 이미지 업로드 */}
        <div className="mb-6">
          <label htmlFor="image-upload" className="block w-full py-3 text-center border-2 border-dashed border-gray-300 rounded cursor-pointer hover:bg-gray-50">
            {MODAL_MESSAGES.ADD_IMAGE}
          </label>
          <input type="file" multiple accept="image/*" onChange={handleImageUpload} className="hidden" id="image-upload" />
        </div>

        {/* 이미지 그리드 */}
        <DragDropContext onDragEnd={handleDragEnd}>
          <Droppable droppableId="images" direction="horizontal">
            {(provided) => (
              <div
                {...provided.droppableProps}
                ref={provided.innerRef}
                className={`grid grid-flow-row-dense grid-cols-${IMAGE_CONSTANTS.GRID_COLUMNS.DEFAULT} md:grid-cols-${IMAGE_CONSTANTS.GRID_COLUMNS.MD} gap-4`}>
                {nextImageList.map((image, index) => (
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
                        }}>
                        <div className={`relative aspect-[3/4] ${snapshot.isDragging ? "z-50" : ""}`}>
                          <div className="absolute inset-0 bg-white rounded overflow-hidden">
                            <Image src={signedImageUrls[image].url} alt={`Image ${index + 1}`} fill className="object-cover" />
                            <div
                              className="absolute inset-0 bg-black bg-opacity-0 
                              group-hover:bg-opacity-30 transition-opacity">
                              <button
                                onClick={() => handleImageDelete(index)}
                                className="absolute top-2 right-2 text-white 
                                opacity-0 group-hover:opacity-100 transition-opacity">
                                ✕
                              </button>
                            </div>
                            {index === 0 && (
                              <div
                                className="absolute top-2 left-2 bg-blue-500 
                              text-white text-xs px-2 py-1 rounded">
                                {MODAL_MESSAGES.PROFILE_LABEL}
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
    } catch (_) {
      setError("인증 과정에서 오류가 발생했습니다.");
    }
  };

  return (
    <div className={CSS_CLASSES.MODAL_OVERLAY}>
      <div className="bg-white rounded-lg p-6 max-w-md w-full">
        <h2 className="text-xl font-bold mb-4">{AUTH_MESSAGES.TITLE}</h2>
        <form onSubmit={handleSubmit}>
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full border rounded px-3 py-2 mb-4" placeholder="비밀번호를 입력하세요" />
          {error && <p className="text-red-500 mb-4">{error}</p>}
          <div className="flex justify-end gap-3">
            <button type="button" onClick={onClose} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded">
              {AUTH_MESSAGES.CANCEL}
            </button>
            <button type="submit" className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
              {AUTH_MESSAGES.CONFIRM}
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
  const [modelData, setModelData] = useState<ModelDetail>();
  const [localSignedUrls, setLocalSignedUrls] = useState<SignedImageUrls | undefined>(undefined);
  const images_length = modelData?.images ? modelData.images.length : 0;
  const { setModel, setSignedUrls, getSignedUrls } = useModelStore();

  const getAndSetModelData = async () => {
    if (!id) return;
    const { modelData, signedUrls } = await getModelDetail(id, getSignedUrls());
    setAllModelData(modelData);
    setAllSignedUrls(signedUrls);
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
  const setAllModelData = (model: ModelDetail) => {
    setModel(model);
    setModelData(model);
  };
  const setAllSignedUrls = (signedUrls: SignedImageUrls | undefined) => {
    setSignedUrls(signedUrls);
    setLocalSignedUrls((original) => {
      const newSignedUrls = { ...original, ...signedUrls };
      return newSignedUrls;
    });
  };
  const handleImageClick = (index: number) => {
    setSelectedImageIndex(index);
    setShowModal(true);
  };

  const updateModel = async (model: ModelDetail, field: keyof ModelDetail, value: string | string[]) => {
    const newModel = await updateModelField(model.id, field, value);
    setAllModelData(newModel);
  };
  const setAllModels = (model: ModelDetail) => {
    setAllModelData(model);
  };
  return (
    <>
      {modelData ? (
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
              <ImageManager model={modelData} onEditAttempt={handleEditAttempt} setModel={setAllModels} signedUrls={localSignedUrls || {}} setSignedUrls={setAllSignedUrls} />
            </div>

            {/* 모델 정보 */}
            <div className="md:w-1/2 ml-5">
              <h1 className="text-4xl font-bold mb-6">
                <EditableField value={modelData.displayName} field="displayName" model={modelData} className="text-4xl font-bold" onEditAttempt={handleEditAttempt} updateModel={updateModel} />
              </h1>

              {/* 소셜 미디어 링크 */}
              <div className="flex gap-4 mb-6">
                <EditableLink value={modelData.instagram} field="instagram" model={modelData} icon={<FaInstagram />} onEditAttempt={handleEditAttempt} updateModel={updateModel} />
                <EditableLink value={modelData.tiktok} field="tiktok" model={modelData} icon={<FaTiktok />} onEditAttempt={handleEditAttempt} updateModel={updateModel} />
                <EditableLink value={modelData.youtube} field="youtube" model={modelData} icon={<FaYoutube />} onEditAttempt={handleEditAttempt} updateModel={updateModel} />
              </div>

              <div className="space-y-2 mb-8 text-lg">
                {modelData.height && (
                  <p>
                    <span className="font-semibold">Height:</span>{" "}
                    <EditableField value={modelData.height} field="height" model={modelData} onEditAttempt={handleEditAttempt} updateModel={updateModel} />
                  </p>
                )}
                {modelData.weight && (
                  <p>
                    <span className="font-semibold">Weight:</span>{" "}
                    <EditableField value={modelData.weight} field="weight" model={modelData} onEditAttempt={handleEditAttempt} updateModel={updateModel} />
                  </p>
                )}
                {modelData.size && (
                  <p>
                    <span className="font-semibold">Size:</span> <EditableField value={modelData.size} field="size" model={modelData} onEditAttempt={handleEditAttempt} updateModel={updateModel} />
                  </p>
                )}
              </div>
              {modelData.modelingInfo && (
                <EditableList values={modelData.modelingInfo} field="modelingInfo" model={modelData} title="Experience" onEditAttempt={handleEditAttempt} updateModel={updateModel} />
              )}
            </div>
          </div>

          {/* 추가 이미지 그리드 */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {modelData.images &&
              modelData.images?.length > 1 &&
              modelData.images.slice(1).map((image, index) =>
                localSignedUrls ? (
                  <div key={index} className="flex flex-col items-center cursor-pointer relative aspect-[3/4] rounded-lg overflow-hidden shadow-md hover:scale-105 transition-transform duration-300">
                    <div className="relative w-full aspect-[3/4]" onClick={() => handleImageClick(index + 1)}>
                      <Image src={`${localSignedUrls[image].url}&format=webp&quality=80`} alt={`${modelData.name} ${index + 2}`} fill className="object-cover" sizes="(max-width: 768px) 50vw, 25vw" />
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
                    src={localSignedUrls && modelData.images ? localSignedUrls[modelData.images[selectedImageIndex]].url : ""}
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
      ) : (
        <ModelDetailSkeleton />
      )}
    </>
  );
}
