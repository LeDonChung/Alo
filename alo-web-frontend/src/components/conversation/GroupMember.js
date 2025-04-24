import React, { use, useState } from 'react';
import { getFriend } from '../../utils/AppUtils';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faKey, faEllipsis } from '@fortawesome/free-solid-svg-icons';
import MenuMember from './MenuMember';
import { useSelector } from 'react-redux';

const GroupMembers = ({ conversation, userLogin, setIsSetting, membersWithRoles }) => {
    const members = conversation.memberUserIds.map(userId => getFriend(conversation, userId));
    const leaderId = conversation.roles.find(role => role.role === 'leader')?.userIds[0];
    const viceLeaderIds = conversation.roles.find(role => role.role === 'vice_leader')?.userIds || [];
    const friends = useSelector((state) => state.friend.friends);
    


    const filterFriendId = () => {
        const memberUserIds = conversation.memberUserIds;
        const friendIds = [];
        if (friends && friends.length > 0) {
            for (let friend of friends) {
                if (memberUserIds.includes(friend.friendInfo.id)) {
                    friendIds.push(friend.friendId);
                }
            }
        }
        return friendIds;
    }

    const [isOpenMenu, setIsOpenMenu] = useState(false);
    const [memberSelected, setMemberSelected] = useState(null);
    const [isFriends, setIsFriends] = useState(filterFriendId());


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
                    <div key={index} className="flex items-center space-x-3 p-2 hover:bg-gray-50 rounded-md transition-colors relative">
                        <img
                            src={member.avatarLink || 'https://my-alo-bucket.s3.amazonaws.com/1742401840267-OIP%20%282%29.jpg'}
                            alt={member.fullName}
                            className="w-10 h-10 rounded-full"
                        />
                        <div className="flex-1">
                            <p className="text-sm font-medium text-gray-900">{member.id === userLogin.id ? 'Bạn' : member.fullName}</p>
                            {
                                leaderId === member.id && (
                                    <>
                                        <div className="flex items-center justify-center text-sm bg-slate-500 rounded-full px-2 py-1 w-4 h-4 absolute bottom-3 left-9">
                                            <FontAwesomeIcon icon={faKey} className="text-yellow-400 text-[9px]" />
                                        </div>
                                        <p className="text-xs text-gray-500">Trường nhóm</p>
                                    </>
                                )
                            }

                            {
                                viceLeaderIds.includes(member.id) && (
                                    <>
                                        <div className="flex items-center justify-center text-sm bg-slate-500 rounded-full px-2 py-1 w-4 h-4 absolute bottom-3 left-9">
                                            <FontAwesomeIcon icon={faKey} className="text-white text-[9px]" />
                                        </div>
                                        <p className="text-xs text-gray-500">Phó nhóm</p>
                                    </>
                                )
                            }
                        </div>

                        {
                            // trưởng nhóm: gỡ quyền phó nhóm, xóa khỏi nhóm -> thành viên khác; chính mình -> rời nhóm --> modal chọn nhóm trưởng mới trước khi rời
                            // pho nhóm: xóa khỏi nhóm (thành viên không là nhóm trưởng và phó); chính mình -> rời nhóm
                            // thành viên: rời nhóm
                            userLogin.id === leaderId ? (
                                <>
                                    {/* {
                                        isFriends && (isFriends.includes(member.id) || member.id === userLogin.id) ? ( */}
                                    <button
                                        onClick={() => {
                                            setIsOpenMenu(!isOpenMenu);
                                            setMemberSelected(member);
                                        }}
                                        className="p-2 rounded-full hover:bg-gray-200 transition-colors"
                                    >
                                        <FontAwesomeIcon icon={faEllipsis} className="text-gray-600" />
                                    </button>
                                    {/*  ) : (
                                             <button className='p-2 rounded-sm bg-blue-100 hover:bg-blue-200 transition-colors'>
                                                 <span className="text-sm text-blue-600">Kết bạn</span>
                                             </button>
                                         )
                                    } */}
                                </>
                            ) : (
                                viceLeaderIds.includes(userLogin.id) && ((member.id !== userLogin.id && !viceLeaderIds.includes(member.id) && member.id !== leaderId) || (userLogin.id === member.id)) && (
                                    <button
                                        onClick={() => {
                                            setIsOpenMenu(!isOpenMenu);
                                            setMemberSelected(member);
                                        }}
                                        className="p-2 rounded-sm hover:bg-gray-200 transition-colors"
                                    >
                                        <FontAwesomeIcon icon={faEllipsis} className="text-gray-600" />
                                    </button>
                                )
                            )
                        }


                        {/* role -> member */}
                        {
                            userLogin.id === member.id && member.id !== leaderId && !viceLeaderIds.includes(member.id) && (
                                <>
                                    <button
                                        onClick={() => {
                                            setIsOpenMenu(!isOpenMenu);
                                            setMemberSelected(member);
                                        }}
                                        className="p-2 rounded-sm hover:bg-gray-200 transition-colors"
                                    >
                                        <FontAwesomeIcon icon={faEllipsis} className="text-gray-600" />
                                    </button>
                                </>
                            )
                        }


                        {
                            isOpenMenu && memberSelected?.id === member.id && (
                                <MenuMember
                                    leaderId={leaderId}
                                    viceLeaderIds={viceLeaderIds}
                                    member={memberSelected}
                                    conversation={conversation}
                                    isOpen={isOpenMenu}
                                    userLogin={userLogin}
                                    onClose={() => setIsOpenMenu(false)} />
                            )
                        }
                    </div>
                ))}
            </div>
        </div>
    );
};

export default GroupMembers;