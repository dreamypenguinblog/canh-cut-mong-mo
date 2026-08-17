# Firebase setup cho Dreamy Penguin

## 1. Cài Firebase SDK

```bash
npm install firebase
```

## 2. Bật Authentication

Firebase Console → Authentication → Sign-in method:

- Google: Enable
- Anonymous: Enable

Google là tài khoản thật. Anonymous chỉ dùng để nhận diện người đọc chưa đăng nhập; không phải tài khoản giả để tạo view.

## 3. Firestore

Firestore Database đã được tạo. Vào Rules và publish file `firestore.rules` ở thư mục gốc.

Web lưu các dữ liệu sau trực tiếp trên Firestore, không dùng localStorage:

- `novels`
- `chapters`
- `comments`
- `viewEvents`
- `users/{uid}/library`
- `users/{uid}/history`
- `users/{uid}/bookmarks`

`localStorage` chỉ còn được dùng cho giao diện/thiết lập đọc như theme và font.

## 4. View

Một lượt xem chương chỉ được gửi sau khi người đọc ở trang chương ít nhất 10 giây.

Cùng một Firebase UID + chương chỉ được ghi tối đa một event trong mỗi cửa sổ 30 phút.

Không có seed/random/auto view.

Lưu ý: Firebase client không thể tự chứng minh 100% rằng một request là con người. Để chống bot mạnh hơn khi đưa production, bật Firebase App Check (reCAPTCHA Enterprise) và enforcement cho Firestore.

## 5. Chạy

```bash
npm install
npm run dev
```


### Đăng nhập và trạng thái khách
Khách truy cập không được coi là tài khoản trong giao diện. Firebase có thể tạo một Anonymous Auth session ẩn để chống trùng lượt xem; session này không tạo document `users` và không hiện tên/avatar. Khi Google đăng nhập mới tạo/đọc user thật.


## Cấu trúc tối ưu mới
- Dữ liệu public (truyện/chương/comment) được đọc một lần khi mở app thay vì giữ 3 `onSnapshot()` toàn cục.
- Library/history/bookmarks chỉ đọc một lần khi tài khoản thật đăng nhập.
- Reader và các màn hình public được lazy-load thành các chunk/plugin; Author Dashboard chỉ được tải khi vào dashboard.
- Comment, like và view vẫn ghi trực tiếp Firestore; không dùng localStorage cho các số liệu này.
- Anonymous Firebase UID vẫn được dùng ngầm cho comment/like/view khi khách chưa đăng nhập.

## Firebase optimization notes
- Chapter comments are paginated (20 documents per request) instead of loading the whole chapter's comments at once.
- The global community feed is also paginated (20 comments per request).
- Existing like/comment/view actions update local React state after a successful Firestore write instead of refetching the same documents.
- Deleting a chapter cleans up its Firestore comments and real viewEvents, including cleanup in batches under Firestore's 500-write limit.
- `firestore.indexes.json` contains the index used for paginated chapter-comment queries.
- Public Reader uses lazy-loaded reader plugins; author dashboard is loaded only when opened.
