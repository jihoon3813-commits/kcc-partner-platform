'use client';

import React, { useState } from 'react';
import { Download, FileImage, FileVideo, FileText, PlayCircle, Image as ImageIcon, Loader2, X } from 'lucide-react';
import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';

interface Resource {
    id: string;
    type: 'image' | 'video' | 'file';
    title: string;
    description: string;
    date: string;
    downloadUrl: string;
    thumbnail: string;
}

export default function PartnerResourcesPage() {
    const [activeTab, setActiveTab] = useState<'all' | 'image' | 'video' | 'file'>('all');
    const [previewResource, setPreviewResource] = useState<Resource | null>(null);

    const convexResources = useQuery(api.resources.listResources);

    const resources = React.useMemo(() => {
        if (!convexResources) return [];
        return convexResources.map(r => ({
            id: r._id,
            type: (r.type || 'image') as 'image' | 'video' | 'file',
            title: r.title || '',
            description: r.description || '',
            date: new Date(r._creationTime).toISOString(),
            downloadUrl: r.downloadUrl || '',
            thumbnail: r.thumbnail || ''
        }));
    }, [convexResources]);

    const isLoading = convexResources === undefined;

    const filteredResources = activeTab === 'all'
        ? resources
        : resources.filter(res => res.type === activeTab);

    const handleDownload = async (e: React.MouseEvent, url: string, filename: string) => {
        e.preventDefault();
        e.stopPropagation();

        try {
            const response = await fetch(url);
            const blob = await response.blob();
            const blobUrl = window.URL.createObjectURL(blob);

            const a = document.createElement('a');
            a.href = blobUrl;
            a.download = filename || 'download';
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(blobUrl);
            document.body.removeChild(a);
        } catch (error) {
            console.error('Download failed:', error);
            // Fallback
            window.open(url, '_blank');
        }
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
                        className="w-full h-full bg-white rounded-lg"
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
                // Use Google Drive Thumbnail API (sz=w800 for width 800px)
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
        <div className="max-w-7xl mx-auto py-8 px-4">
            <div className="mb-8">
                <h1 className="text-3xl font-black text-gray-900 mb-2">자료실</h1>
                <p className="text-gray-500 font-medium">홍보 및 영업 활동에 필요한 이미지, 영상 자료를 다운로드하세요.</p>
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
                        <div key={item.id} className="group bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 flex flex-col cursor-pointer" onClick={() => setPreviewResource(item)}>
                            {/* Thumbnail */}
                            <div className="relative aspect-video bg-gray-100 overflow-hidden">
                                {item.thumbnail ? (
                                    <img src={getThumbnailSrc(item.thumbnail)} alt={item.title} className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-500" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center bg-gray-50 text-gray-300">
                                        {item.type === 'file' ? <FileText size={50} /> : <ImageIcon size={40} />}
                                    </div>
                                )}
                                <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors" />

                                {/* Overlay Icon */}
                                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
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
                            <div className="p-6 flex flex-col flex-1">
                                <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-1 group-hover:text-indigo-600 transition-colors">{item.title}</h3>
                                <p className="text-sm text-gray-500 mb-6 line-clamp-2 h-10">{item.description}</p>

                                <div className="flex items-center justify-between mt-auto pt-4 border-t border-gray-100">
                                    <span className="text-xs text-gray-400 font-medium">{item.date?.substring(0, 10)}</span>

                                    <div className="flex gap-2">
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setPreviewResource(item);
                                            }}
                                            className="p-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors"
                                            title="미리보기"
                                        >
                                            {item.type === 'video' ? <PlayCircle size={16} /> : (item.type === 'file' ? <FileText size={16} /> : <ImageIcon size={16} />)}
                                        </button>
                                        <button
                                            onClick={(e) => handleDownload(e, item.downloadUrl, item.title)}
                                            className="flex items-center gap-2 px-3 py-1.5 bg-gray-900 text-white rounded-lg text-xs font-bold hover:bg-indigo-600 transition-colors shadow-md transform hover:scale-105"
                                        >
                                            <Download size={14} /> 다운로드
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {!isLoading && filteredResources.length === 0 && (
                <div className="text-center py-20 text-gray-400">
                    <p>등록된 자료가 없습니다.</p>
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
                            <X size={24} />
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
                            onClick={(e) => handleDownload(e, previewResource.downloadUrl, previewResource.title)}
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
