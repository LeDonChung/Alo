import React, { useEffect, useRef, useState } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/esm/Page/AnnotationLayer.css';
import { renderAsync } from 'docx-preview';
import * as XLSX from 'xlsx';
import axios from 'axios';

// Cài đặt worker đúng version pdfjs-dist dùng bởi react-pdf
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@2.16.105/build/pdf.worker.min.js`;

const ModalFile = ({ fileName, fileLink, isOpen, onClose }) => {
    const containerRef = useRef(null);
    const [fileExtension, setFileExtension] = useState('');
    const [txtContent, setTxtContent] = useState('');

    const [excelData, setExcelData] = useState(null);
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (!fileLink) return;

        const ext = fileName?.split('.').pop()?.toLowerCase() || '';
        setFileExtension(ext);
        setError('');
        setTxtContent('');
        setExcelData(null);
        setIsLoading(true);

        if (ext === 'txt') {
            axios.get(fileLink, { responseType: 'text' })
                .then(res => {
                    setTxtContent(res.data);
                })
                .catch(() => setError('Không thể tải nội dung file .txt.'))
                .finally(() => setIsLoading(false));
        } else if (ext === 'xlsx' || ext === 'xls') {
            axios.get(fileLink, { responseType: 'arraybuffer' })
                .then(res => {
                    const data = new Uint8Array(res.data);
                    const workbook = XLSX.read(data, { type: 'array' });
                    const sheetName = workbook.SheetNames[0];
                    const worksheet = workbook.Sheets[sheetName];
                    const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
                    setExcelData(jsonData);
                })
                .catch(() => setError('Không thể tải nội dung file Excel.'))
                .finally(() => setIsLoading(false));
        } else if (ext === 'docx') {
            axios.get(fileLink, { responseType: 'arraybuffer' })
                .then(res => {
                    if (!containerRef.current) {
                        setError('Không thể hiển thị file .docx.');
                        setIsLoading(false);
                        return;
                    }
                    renderAsync(res.data, containerRef.current)
                        .catch(() => setError('Không thể tải nội dung file .docx.'))
                        .finally(() => setIsLoading(false));
                })
                .catch(() => {
                    setError('Không thể tải nội dung file .docx.');
                    setIsLoading(false);
                });
        } else {
            setError('Định dạng file không được hỗ trợ.');
            setIsLoading(false);
        }
    }, [fileLink, fileName]);

    useEffect(() => {
        if (!isOpen) {
            setError('');
            setTxtContent('');
            setExcelData(null);
            setIsLoading(false);
            setFileExtension('');
        }
    }, [isOpen]);

    if (!isOpen || !fileLink) return null;

    return (
        <div
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
            onClick={onClose}
        >
            <div
                className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] p-6 relative flex flex-col"
                onClick={(e) => e.stopPropagation()}
                style={{ height: '90vh' }}
            >
                <div className="flex justify-between items-center mb-4 flex-shrink-0">
                    <h3 className="font-semibold text-lg break-words max-w-[90%]">{fileName}</h3>
                    <button
                        className="text-gray-500 hover:text-gray-900 font-bold text-xl"
                        onClick={onClose}
                        aria-label="Close modal"
                    >
                        &times;
                    </button>
                </div>

                {isLoading && (
                    <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-75">
                        <span className="text-gray-700">Đang tải...</span>
                    </div>
                )}

                <div className="overflow-y-auto flex-grow" style={{ minHeight: 0 }}>
                    {error ? (
                        <p className="text-red-500">{error}</p>
                    ) : (
                        <>
                            {fileExtension === 'docx' && <div ref={containerRef} className="prose max-w-none"></div>}

                            {fileExtension === 'txt' && (
                                <pre className="whitespace-pre-wrap break-words">{txtContent || 'Đang tải...'}</pre>
                            )}

                            {(fileExtension === 'xls' || fileExtension === 'xlsx') && excelData && (
                                <table className="table-auto border-collapse border border-gray-300 w-full text-sm">
                                    <tbody>
                                        {excelData.map((row, i) => (
                                            <tr key={i} className={i === 0 ? 'font-bold bg-gray-100' : ''}>
                                                {row.map((cell, j) => (
                                                    <td key={j} className="border border-gray-300 px-2 py-1 whitespace-nowrap">
                                                        {cell !== undefined ? cell.toString() : ''}
                                                    </td>
                                                ))}
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            )}
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ModalFile;
