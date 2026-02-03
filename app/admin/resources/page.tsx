'use client';

import React, { useState, useEffect } from 'react';
import { Download, FileImage, FileVideo, FileText, PlayCircle, Image as ImageIcon, Plus, Trash2, Loader2, Link as LinkIcon, Save, UploadCloud } from 'lucide-react';

interface Resource {
    id: string;
    type: 'image' | 'video' | 'file';
    title: string;
    description: string;
    date: string;
    downloadUrl: string;
    thumbnail: string;
}

export default function AdminResourcesPage() {
    const [resources, setResources] = useState<Resource[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [activeTab, setActiveTab] = useState<'all' | 'image' | 'video' | 'file'>('all');

    // Modal States
    const [showModal, setShowModal] = useState(false);
    const [newRes, setNewRes] = useState<{ type: 'image' | 'video' | 'file', title: string, description: string, downloadUrl: string, thumbnail: string }>({
        type: 'image',
        title: '',
        description: '',
        downloadUrl: '',
        thumbnail: ''
    });

    // File Upload States
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [selectedThumbnail, setSelectedThumbnail] = useState<File | null>(null);
    const [uploadProgress, setUploadProgress] = useState('');

    useEffect(() => {
        fetchResources();
    }, []);

    const fetchResources = async () => {
        setIsLoading(true);
        try {
            const res = await fetch('/api/data?action=read_resources');
            const json = await res.json();
            if (json.success) {
                setResources(json.data.reverse());
            }
        } catch {
            console.error("Failed to fetch resources");
        } finally {
            setIsLoading(false);
        }
    };

    const convertToBase64 = (file: File): Promise<string> => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => {
                const result = reader.result as string;
                // Remove the "data:*/*;base64," prefix for GAS
                const base64 = result.split(',')[1];
                resolve(base64);
            };
            reader.onerror = error => reject(error);
        });
    };

    const uploadFileToDrive = async (file: File): Promise<string | null> => {
        try {
            const base64Data = await convertToBase64(file);

            const payload = {
                filename: file.name,
                mimeType: file.type,
                base64Data: base64Data
            };

            const res = await fetch('/api/data?action=upload_file', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            const json = await res.json();
            if (json.success) {
                return json.url;
            } else {
                alert('파일 업로드 실패: ' + json.message);
                return null;
            }
        } catch (e) {
            console.error(e);
            alert('파일 업로드 중 오류 발생');
            return null;
        }
    };

    const handleCreate = async () => {
        if (!newRes.title) return alert('제목은 필수입니다.');

        setIsSubmitting(true);
        setUploadProgress('준비 중...');

        try {
            let finalDownloadUrl = newRes.downloadUrl;
            let finalThumbnailUrl = newRes.thumbnail;

            // 1. Upload Main File
            if (selectedFile) {
                setUploadProgress('메인 파일 업로드 중...');
                const uploadedUrl = await uploadFileToDrive(selectedFile);
                if (!uploadedUrl) {
                    setIsSubmitting(false);
                    return;
                }
                finalDownloadUrl = uploadedUrl;
            } else if (!finalDownloadUrl) {
                // No file and no URL
                alert('파일을 업로드하거나 다운로드 링크를 입력해주세요.');
                setIsSubmitting(false);
                return;
            }

            // 2. Upload Thumbnail
            if (selectedThumbnail) {
                setUploadProgress('썸네일 업로드 중...');
                const uploadedThumb = await uploadFileToDrive(selectedThumbnail);
                if (uploadedThumb) {
                    finalThumbnailUrl = uploadedThumb;
                }
            }

            // 3. Create Resource Record
            setUploadProgress('데이터 저장 중...');

            // If it's an image and no thumbnail is provided, use the main image as thumbnail
            if (newRes.type === 'image' && !finalThumbnailUrl) {
                finalThumbnailUrl = finalDownloadUrl;
            }

            const payload = {
                ...newRes,
                downloadUrl: finalDownloadUrl,
                thumbnail: finalThumbnailUrl
            };

            const res = await fetch('/api/data?action=create_resource', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            const json = await res.json();

            if (json.success) {
                alert('자료가 등록되었습니다.');
                setShowModal(false);
                setNewRes({ type: 'image', title: '', description: '', downloadUrl: '', thumbnail: '' });
                setSelectedFile(null);
                setSelectedThumbnail(null);
                setUploadProgress('');
                fetchResources();
            } else {
                alert('등록 실패: ' + json.message);
            }
        } catch {
            alert('통신 오류');
        } finally {
            setIsSubmitting(false);
            setUploadProgress('');
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('정말 삭제하시겠습니까?')) return;

        try {
            const res = await fetch('/api/data?action=delete_resource', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id })
            });
            const json = await res.json();
            if (json.success) {
                alert('삭제되었습니다.');
                fetchResources();
            } else {
                alert('삭제 실패: ' + json.message);
            }
        } catch {
            alert('통신 오류');
        }
    };

    const [previewResource, setPreviewResource] = useState<Resource | null>(null);

    // Moved here to restore functionality
    const filteredResources = activeTab === 'all'
        ? resources
        : resources.filter(res => res.type === activeTab);

    const handleDownload = (e: React.MouseEvent, url: string) => {
        e.preventDefault();
        e.stopPropagation();

        let downloadLink = url;
        // Google Drive 'view' link conversion to 'download' link
        if (url.includes('drive.google.com/uc?export=view')) {
            downloadLink = url.replace('export=view', 'export=download');
        }

        // Create invisible anchor to trigger download
        const a = document.createElement('a');
        a.href = downloadLink;
        a.setAttribute('download', ''); // Attempt to force download
        a.target = '_blank';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    };

    const getPreviewContent = (resource: Resource) => {
        // Universal Handler for Google Drive Links (Images, Videos, and Files like PDF)
        // Using iframe preview is much more reliable for Drive hosted content due to CORS/Protection
        if (resource.downloadUrl.includes('drive.google.com')) {
            let fileId = '';
            const url = resource.downloadUrl;

            // Extract File ID
            if (url.includes('id=')) {
                fileId = url.split('id=')[1].split('&')[0];
            } else if (url.includes('/file/d/')) {
                fileId = url.split('/file/d/')[1].split('/')[0];
            }

            if (fileId) {
                return (
                    <iframe
                        src={`https://drive.google.com/file/d/${fileId}/preview`}
                        className="w-full h-full bg-white rounded-lg" // White bg for documents
                        allow="autoplay; fullscreen"
                        title={resource.title}
                    />
                );
            }
        }

        // Fallback for non-Drive images
        if (resource.type === 'image') {
            return (
                <img
                    src={resource.downloadUrl}
                    alt={resource.title}
                    className="w-full h-full object-contain"
                />
            );
        }

        // Fallback for non-Drive videos
        if (resource.type === 'video') {
            return (
                <video controls className="w-full h-full">
                    <source src={resource.downloadUrl} />
                    브라우저가 이 동영상을 지원하지 않습니다.
                </video>
            );
        }

        // Fallback for non-Drive files (no preview, just message)
        if (resource.type === 'file') {
            return (
                <div className="flex flex-col items-center justify-center h-full text-white">
                    <FileText size={80} className="mb-4 opacity-50" />
                    <p className="text-xl font-bold">미리보기를 지원하지 않는 파일입니다.</p>
                    <p className="text-gray-400 mt-2">다운로드하여 확인해주세요.</p>
                </div>
            );
        }

        return null;
    };

    const getThumbnailSrc = (url: string) => {
        if (!url) return '';
        // If it's a Google Drive URL, convert to thumbnail API
        if (url.includes('drive.google.com')) {
            let fileId = '';
            if (url.includes('id=')) {
                fileId = url.split('id=')[1].split('&')[0];
            } else if (url.includes('/file/d/')) {
                fileId = url.split('/file/d/')[1].split('/')[0];
            }
            if (fileId) {
                // Use Google Drive Thumbnail API
                return `https://drive.google.com/thumbnail?id=${fileId}&sz=w800`;
            }
        }
        return url;
    };

    const getIconForType = (type: string) => {
        if (type === 'video') return <PlayCircle className="text-white drop-shadow-lg" size={40} />;
        if (type === 'file') return <FileText className="text-white drop-shadow-lg" size={40} />;
        return <ImageIcon className="text-white drop-shadow-lg" size={40} />;
    };

    return (
        <div className="max-w-7xl mx-auto py-8">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-black text-gray-900 mb-2">자료실 관리</h1>
                    <p className="text-gray-500 font-medium">파트너에게 제공할 이미지 및 영상 자료를 관리합니다.</p>
                </div>
                <button
                    onClick={() => setShowModal(true)}
                    className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200"
                >
                    <Plus size={20} /> 자료 등록
                </button>
            </div>

            {/* Filter Tabs */}
            <div className="flex gap-4 mb-8">
                <button
                    onClick={() => setActiveTab('all')}
                    className={`px-6 py-2.5 rounded-full font-bold text-sm transition-all ${activeTab === 'all' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200' : 'bg-white text-gray-500 hover:bg-gray-50 border border-gray-200'}`}
                >
                    전체보기
                </button>
                <button
                    onClick={() => setActiveTab('image')}
                    className={`px-6 py-2.5 rounded-full font-bold text-sm transition-all flex items-center gap-2 ${activeTab === 'image' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200' : 'bg-white text-gray-500 hover:bg-gray-50 border border-gray-200'}`}
                >
                    <FileImage size={16} /> 이미지 자료
                </button>
                <button
                    onClick={() => setActiveTab('video')}
                    className={`px-6 py-2.5 rounded-full font-bold text-sm transition-all flex items-center gap-2 ${activeTab === 'video' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200' : 'bg-white text-gray-500 hover:bg-gray-50 border border-gray-200'}`}
                >
                    <FileVideo size={16} /> 영상 자료
                </button>
                <button
                    onClick={() => setActiveTab('file')}
                    className={`px-6 py-2.5 rounded-full font-bold text-sm transition-all flex items-center gap-2 ${activeTab === 'file' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200' : 'bg-white text-gray-500 hover:bg-gray-50 border border-gray-200'}`}
                >
                    <FileText size={16} /> 일반 자료
                </button>
            </div>

            {/* Resources Grid */}
            {isLoading ? (
                <div className="flex justify-center py-20">
                    <Loader2 className="animate-spin text-gray-300" size={40} />
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {filteredResources.map((item) => (
                        <div key={item.id} className="group bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 relative flex flex-col">
                            {/* Admin Actions */}
                            <div className="absolute top-2 right-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
                                <button onClick={() => handleDelete(item.id)} className="p-2 bg-red-500 text-white rounded-lg hover:bg-red-600 shadow-md transform hover:scale-105 transition-transform" title="삭제">
                                    <Trash2 size={16} />
                                </button>
                            </div>

                            {/* Thumbnail */}
                            <div
                                className="relative aspect-video bg-gray-100 overflow-hidden cursor-pointer group-hover:opacity-95 transition-opacity"
                                onClick={() => setPreviewResource(item)}
                            >
                                {item.thumbnail ? (
                                    <img src={getThumbnailSrc(item.thumbnail)} alt={item.title} className="w-full h-full object-cover object-top" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center bg-gray-50 text-gray-300">
                                        {item.type === 'file' ? <FileText size={50} /> : <ImageIcon size={40} />}
                                    </div>
                                )}

                                {/* Overlay Icon */}
                                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/20">
                                    {getIconForType(item.type)}
                                </div>

                                <div className="absolute top-3 left-3">
                                    {item.type === 'image' && (
                                        <span className="bg-indigo-600/90 text-white text-[10px] font-bold px-2 py-1 rounded-md backdrop-blur-sm flex items-center gap-1 uppercase tracking-wide">
                                            <ImageIcon size={10} /> Image
                                        </span>
                                    )}
                                    {item.type === 'video' && (
                                        <span className="bg-rose-500/90 text-white text-[10px] font-bold px-2 py-1 rounded-md backdrop-blur-sm flex items-center gap-1 uppercase tracking-wide">
                                            <PlayCircle size={10} /> Video
                                        </span>
                                    )}
                                    {item.type === 'file' && (
                                        <span className="bg-emerald-600/90 text-white text-[10px] font-bold px-2 py-1 rounded-md backdrop-blur-sm flex items-center gap-1 uppercase tracking-wide">
                                            <FileText size={10} /> File
                                        </span>
                                    )}
                                </div>
                            </div>

                            {/* Content */}
                            <div className="p-5 flex flex-col flex-1">
                                <h3
                                    className="text-lg font-bold text-gray-900 mb-1 line-clamp-1 cursor-pointer hover:text-indigo-600 transition-colors"
                                    onClick={() => setPreviewResource(item)}
                                >
                                    {item.title}
                                </h3>
                                <p className="text-sm text-gray-500 mb-4 line-clamp-2 h-10">{item.description}</p>

                                <div className="flex items-center justify-between mt-auto pt-4 border-t border-gray-100">
                                    <span className="text-xs text-gray-400 font-medium">{item.date}</span>

                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => setPreviewResource(item)}
                                            className="p-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors"
                                            title="미리보기"
                                        >
                                            {item.type === 'video' ? <PlayCircle size={16} /> : (item.type === 'file' ? <FileText size={16} /> : <ImageIcon size={16} />)}
                                        </button>
                                        <button
                                            onClick={(e) => handleDownload(e, item.downloadUrl)}
                                            className="flex items-center gap-2 px-3 py-1.5 bg-gray-900 text-white rounded-lg text-xs font-bold hover:bg-indigo-600 transition-colors"
                                        >
                                            <Download size={14} /> 다운로드
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                    {!isLoading && filteredResources.length === 0 && (
                        <div className="col-span-full text-center py-20 text-gray-400">
                            <p>등록된 자료가 없습니다.</p>
                        </div>
                    )}
                </div>
            )}

            {/* Create Modal */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowModal(false)}></div>
                    <div className="bg-white rounded-2xl w-full max-w-lg relative z-10 overflow-hidden shadow-2xl p-8 max-h-[90vh] overflow-y-auto">
                        <h2 className="text-2xl font-black mb-6">새 자료 등록</h2>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-bold text-gray-600 mb-1">자료 유형</label>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => setNewRes({ ...newRes, type: 'image' })}
                                        className={`flex-1 py-3 rounded-xl font-bold border transition-all ${newRes.type === 'image' ? 'border-indigo-600 bg-indigo-50 text-indigo-700' : 'border-gray-200 text-gray-500'}`}
                                    >
                                        이미지
                                    </button>
                                    <button
                                        onClick={() => setNewRes({ ...newRes, type: 'video' })}
                                        className={`flex-1 py-3 rounded-xl font-bold border transition-all ${newRes.type === 'video' ? 'border-rose-600 bg-rose-50 text-rose-700' : 'border-gray-200 text-gray-500'}`}
                                    >
                                        영상
                                    </button>
                                    <button
                                        onClick={() => setNewRes({ ...newRes, type: 'file' })}
                                        className={`flex-1 py-3 rounded-xl font-bold border transition-all ${newRes.type === 'file' ? 'border-emerald-600 bg-emerald-50 text-emerald-700' : 'border-gray-200 text-gray-500'}`}
                                    >
                                        일반 파일
                                    </button>
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-600 mb-1">제목</label>
                                <input
                                    type="text"
                                    value={newRes.title}
                                    onChange={(e) => setNewRes({ ...newRes, title: e.target.value })}
                                    className="w-full p-3 bg-gray-50 rounded-lg font-medium border border-gray-200 outline-none focus:border-indigo-500"
                                    placeholder="자료 제목 입력"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-600 mb-1">설명</label>
                                <textarea
                                    value={newRes.description}
                                    onChange={(e) => setNewRes({ ...newRes, description: e.target.value })}
                                    className="w-full p-3 bg-gray-50 rounded-lg font-medium border border-gray-200 outline-none focus:border-indigo-500 h-24 resize-none"
                                    placeholder="자료에 대한 간단한 설명"
                                />
                            </div>

                            {/* Download File Selection */}
                            <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                                <label className="block text-sm font-bold text-gray-800 mb-2">메인 자료 파일</label>
                                <div className="flex flex-col gap-2">
                                    <div className="flex gap-2">
                                        <label className="flex-1 cursor-pointer">
                                            <input
                                                type="file"
                                                accept={newRes.type === 'image' ? 'image/*' : (newRes.type === 'video' ? 'video/*' : '*/*')}
                                                className="hidden"
                                                onChange={(e) => {
                                                    if (e.target.files?.[0]) {
                                                        setSelectedFile(e.target.files[0]);
                                                        setNewRes({ ...newRes, downloadUrl: '' }); // Clear manual URL if file selected
                                                    }
                                                }}
                                            />
                                            <div className="w-full py-3 px-4 bg-white border border-dashed border-gray-300 rounded-lg flex items-center justify-center gap-2 text-sm font-medium text-gray-500 hover:border-indigo-500 hover:text-indigo-600 transition-colors">
                                                <UploadCloud size={16} />
                                                {selectedFile ? selectedFile.name : '파일 선택 (클릭)'}
                                            </div>
                                        </label>
                                        {selectedFile && (
                                            <button
                                                onClick={() => setSelectedFile(null)}
                                                className="px-3 text-red-500 hover:bg-red-50 rounded-lg"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        )}
                                    </div>
                                    <div className="relative">
                                        <input
                                            type="text"
                                            value={newRes.downloadUrl}
                                            onChange={(e) => {
                                                setNewRes({ ...newRes, downloadUrl: e.target.value });
                                                setSelectedFile(null); // Clear file if manual URL entered
                                            }}
                                            className="w-full pl-10 p-2 bg-white rounded-lg text-sm border border-gray-200 outline-none focus:border-indigo-500"
                                            placeholder="또는 URL 직접 입력"
                                        />
                                        <LinkIcon className="absolute left-3 top-2.5 text-gray-400" size={14} />
                                    </div>
                                </div>
                            </div>

                            {/* Thumbnail Selection */}
                            <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                                <label className="block text-sm font-bold text-gray-800 mb-2">썸네일 이미지 (선택)</label>
                                <div className="flex flex-col gap-2">
                                    <div className="flex gap-2">
                                        <label className="flex-1 cursor-pointer">
                                            <input
                                                type="file"
                                                accept="image/*"
                                                className="hidden"
                                                onChange={(e) => {
                                                    if (e.target.files?.[0]) {
                                                        setSelectedThumbnail(e.target.files[0]);
                                                        setNewRes({ ...newRes, thumbnail: '' });
                                                    }
                                                }}
                                            />
                                            <div className="w-full py-3 px-4 bg-white border border-dashed border-gray-300 rounded-lg flex items-center justify-center gap-2 text-sm font-medium text-gray-500 hover:border-indigo-500 hover:text-indigo-600 transition-colors">
                                                <ImageIcon size={16} />
                                                {selectedThumbnail ? selectedThumbnail.name : '이미지 선택 (클릭)'}
                                            </div>
                                        </label>
                                        {selectedThumbnail && (
                                            <button
                                                onClick={() => setSelectedThumbnail(null)}
                                                className="px-3 text-red-500 hover:bg-red-50 rounded-lg"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        )}
                                    </div>
                                    <div className="relative">
                                        <input
                                            type="text"
                                            value={newRes.thumbnail}
                                            onChange={(e) => {
                                                setNewRes({ ...newRes, thumbnail: e.target.value });
                                                setSelectedThumbnail(null);
                                            }}
                                            className="w-full pl-10 p-2 bg-white rounded-lg text-sm border border-gray-200 outline-none focus:border-indigo-500"
                                            placeholder="또는 URL 직접 입력"
                                        />
                                        <LinkIcon className="absolute left-3 top-2.5 text-gray-400" size={14} />
                                    </div>
                                </div>
                            </div>

                        </div>

                        <div className="flex gap-3 mt-8">
                            <button
                                onClick={() => setShowModal(false)}
                                className="flex-1 py-3 bg-gray-100 text-gray-600 rounded-xl font-bold hover:bg-gray-200 transition-colors"
                            >
                                취소
                            </button>
                            <button
                                onClick={handleCreate}
                                disabled={isSubmitting}
                                className="flex-1 py-3 bg-black text-white rounded-xl font-bold hover:bg-gray-800 transition-colors flex items-center justify-center gap-2"
                            >
                                {isSubmitting ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
                                {isSubmitting ? (uploadProgress || '처리 중...') : '등록하기'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Preview Modal */}
            {previewResource && (
                <div
                    className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md"
                    onClick={() => setPreviewResource(null)}
                >
                    <div className="absolute top-4 right-4 z-10">
                        <button
                            className="p-2 bg-white/10 rounded-full text-white hover:bg-white/20 transition-colors"
                            onClick={() => setPreviewResource(null)}
                        >
                            <Trash2 className="rotate-45" size={24} />
                        </button>
                    </div>

                    <div
                        className="max-w-6xl w-full h-full max-h-[85vh] overflow-hidden rounded-2xl flex items-center justify-center relative"
                        onClick={e => e.stopPropagation()}
                    >
                        {getPreviewContent(previewResource)}
                    </div>

                    <div className="absolute bottom-8 left-0 right-0 text-center">
                        <h3 className="text-white text-xl font-bold mb-4 drop-shadow-md">{previewResource.title}</h3>
                        <button
                            onClick={(e) => handleDownload(e, previewResource.downloadUrl)}
                            className="inline-flex items-center gap-2 px-6 py-3 bg-white text-gray-900 rounded-full font-black hover:scale-105 transition-transform shadow-xl"
                        >
                            <Download size={20} /> 원본 다운로드
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
