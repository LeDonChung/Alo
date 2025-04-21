import React from 'react';
import { getFriend } from '../../utils/AppUtils';

const GroupMembers = ({ conversation, userLogin, setIsSetting, membersWithRoles }) => {
    const members = conversation.memberUserIds.map(userId => getFriend(conversation, userId));

    return (
        <div className="w-full bg-white border-l border-gray-200 p-2 overflow-y-auto max-h-screen scrollbar-thin scrollbar-thumb-gray-300">
            {/* Header */}
            <div className="flex items-center border-b border-gray-200 py-3 mb-4">
                <button
                    onClick={() => setIsSetting(true)}
                    className="p-2 rounded-full hover:bg-gray-200 transition-colors"
                >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                    </svg>
                </button>
                <h3 className="flex-1 text-center text-lg font-semibold text-gray-800">Thành viên nhóm</h3>
            </div>

            {/* Danh sách thành viên */}
            <div className="space-y-2">
                {membersWithRoles.map((member, index) => (
                    <div key={index} className="flex items-center space-x-3 p-2 hover:bg-gray-50 rounded-md transition-colors">
                        <img
                            src={member.avatarLink || 'https://my-alo-bucket.s3.amazonaws.com/1742401840267-OIP%20%282%29.jpg'}
                            alt={member.fullName}
                            className="w-10 h-10 rounded-full"
                        />
                        <div className="flex-1">
                            <p className="text-sm font-medium text-gray-900">{member.fullName}</p>
                            <p className="text-xs text-gray-500">{member.id === userLogin.id ? 'Bạn' : ''}</p>
                            <p className="text-xs text-gray-500">{member.role === 'leader' ? 'Trưởng nhóm' : member.role === 'vice_leader' ? 'Phó nhóm' : 'Thành viên'}</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default GroupMembers;