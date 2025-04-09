const groupFriendData = [
    {
        id: 1,
        name: "Nhóm Cấp 3",
        groupAvatar: "https://i.pravatar.cc/150?img=21",
        category: { id: 1, name: "Bạn thân", color: "#ff6347" },
        createDate: "2023-02-15",
        members: [
            { id: 1, name: "Nguyễn Văn A", avatar: "https://i.pravatar.cc/150?img=1", isTeamLeader: true, isDeputyGroup: false },
            { id: 2, name: "Lý Văn L", avatar: "https://i.pravatar.cc/150?img=11", isTeamLeader: false, isDeputyGroup: true },
            { id: 3, name: "Kiều Văn T", avatar: "https://i.pravatar.cc/150?img=19", isTeamLeader: false, isDeputyGroup: false }
        ]
    },
    {
        id: 2,
        name: "Gia đình nội",
        groupAvatar: "https://i.pravatar.cc/150?img=22",
        category: { id: 3, name: "Gia đình", color: "#32cd32" },
        createDate: "2022-11-03",
        members: [
            { id: 4, name: "Lê Văn C", avatar: "https://i.pravatar.cc/150?img=3", isTeamLeader: true, isDeputyGroup: false },
            { id: 5, name: "Đinh Thị F", avatar: "https://i.pravatar.cc/150?img=6", isTeamLeader: false, isDeputyGroup: true }
        ]
    },
    {
        id: 3,
        name: "Đồng nghiệp công ty ABC",
        groupAvatar: "https://i.pravatar.cc/150?img=23",
        category: { id: 2, name: "Đồng nghiệp", color: "#1e90ff" },
        createDate: "2023-01-10",
        members: [
            { id: 6, name: "Trần Thị B", avatar: "https://i.pravatar.cc/150?img=2", isTeamLeader: true, isDeputyGroup: false },
            { id: 7, name: "Phạm Thị D", avatar: "https://i.pravatar.cc/150?img=4", isTeamLeader: false, isDeputyGroup: true }
        ]
    },
    {
        id: 4,
        name: "Nhóm Giao lưu bóng đá",
        groupAvatar: "https://i.pravatar.cc/150?img=24",
        createDate: "2023-04-25",
        members: [
            { id: 8, name: "Hoàng Văn G", avatar: "https://i.pravatar.cc/150?img=7", isTeamLeader: true, isDeputyGroup: false }
        ]
    },
    {
        id: 5,
        name: "Bạn thân đại học",
        groupAvatar: "https://i.pravatar.cc/150?img=25",
        category: { id: 1, name: "Bạn thân", color: "#ff6347" },
        createDate: "2023-03-07",
        members: [
            { id: 9, name: "Nguyễn Văn A", avatar: "https://i.pravatar.cc/150?img=1", isTeamLeader: true, isDeputyGroup: false }
        ]
    },
    {
        id: 6,
        name: "Gia đình ngoại",
        groupAvatar: "https://i.pravatar.cc/150?img=26",
        category: { id: 3, name: "Gia đình", color: "#32cd32" },
        createDate: "2022-09-18",
        members: [
            { id: 10, name: "Bùi Văn I", avatar: "https://i.pravatar.cc/150?img=9", isTeamLeader: true, isDeputyGroup: false },
            { id: 11, name: "Phan Thị K", avatar: "https://i.pravatar.cc/150?img=10", isTeamLeader: false, isDeputyGroup: true }
        ]
    },
    {
        id: 7,
        name: "Đồng nghiệp cũ",
        groupAvatar: "https://i.pravatar.cc/150?img=27",
        category: { id: 2, name: "Đồng nghiệp", color: "#1e90ff" },
        createDate: "2023-05-01",
        members: [
            { id: 12, name: "Mai Thị O", avatar: "https://i.pravatar.cc/150?img=14", isTeamLeader: true, isDeputyGroup: false }
        ]
    },
    {
        id: 8,
        name: "Nhóm bạn cùng lớp IELTS",
        groupAvatar: "https://i.pravatar.cc/150?img=28",
        category: { id: 4, name: "Quen biết", color: "#8a2be2" },
        createDate: "2023-06-12",
        members: [
            { id: 13, name: "Ngô Thị H", avatar: "https://i.pravatar.cc/150?img=8", isTeamLeader: true, isDeputyGroup: false }
        ]
    },
    {
        id: 9,
        name: "Nhóm bạn thân cấp 2",
        groupAvatar: "https://i.pravatar.cc/150?img=29",
        category: { id: 1, name: "Bạn thân", color: "#ff6347" },
        createDate: "2023-02-28",
        members: [
            { id: 14, name: "Kiều Văn T", avatar: "https://i.pravatar.cc/150?img=19", isTeamLeader: true, isDeputyGroup: false }
        ]
    },
    {
        id: 10,
        name: "Họp mặt gia đình hằng năm",
        groupAvatar: "https://i.pravatar.cc/150?img=30",
        createDate: "2022-12-31",
        members: [
            { id: 15, name: "Chung Văn N", avatar: "https://i.pravatar.cc/150?img=13", isTeamLeader: true, isDeputyGroup: false }
        ]
    },
    {
        id: 11,
        name: "Nhóm chơi game",
        groupAvatar: "https://i.pravatar.cc/150?img=31",
        createDate: "2023-01-20",
        members: [
            { id: 16, name: "Lương Thị U", avatar: "https://i.pravatar.cc/150?img=20", isTeamLeader: true, isDeputyGroup: false }
        ]
    },
    {
        id: 12,
        name: "Đồng nghiệp dự án XYZ",
        groupAvatar: "https://i.pravatar.cc/150?img=32",
        category: { id: 2, name: "Đồng nghiệp", color: "#1e90ff" },
        createDate: "2023-04-08",
        members: [
            { id: 17, name: "Trần Thị B", avatar: "https://i.pravatar.cc/150?img=2", isTeamLeader: true, isDeputyGroup: false }
        ]
    }
];
export default groupFriendData;  