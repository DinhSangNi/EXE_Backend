export enum PostStatus {
  PENDING = 'pending', // Người dùng vừa tạo, chờ admin duyệt
  APPROVED = 'approved', // Admin đã duyệt, bài được hiển thị
  REJECTED = 'rejected', // Admin từ chối bài đăng
  EXPIRED = 'expired', // Bài đã hết hạn
}
