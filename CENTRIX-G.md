# CENTRIX G - Hướng Dẫn Dự Án

## 1. Hướng Dẫn Chạy Source

### Yêu Cầu Môi Trường

- Node.js phù hợp với project React/Vite/Electron.
- Yarn classic (`yarn`).
- Windows PowerShell hoặc Command Prompt để chạy các script hiện có trong `package.json`.

### Cài Đặt Dependencies

```bash
yarn install
```

### Cấu Hình Biến Môi Trường

Copy file mẫu:

```bash
copy .env.example .env
```

Lưu ý:

- `.env` là file local, không push lên git.
- `.env.example` được commit để team biết cần những biến nào.
- Các script hiện tại tự set biến target khi chạy web/desktop.

## Chạy Web

Dùng khi cần phát triển website trên trình duyệt.

```bash
yarn dev:web
```

Hoặc:

```bash
yarn dev
```

Script này sẽ set:

- `VITE_APP_TARGET=web`
- `VITE_ENABLE_WEB=true`
- `VITE_ENABLE_DESKTOP=false`

Sau khi chạy, Vite sẽ mở hoặc cung cấp URL local, thường là:

```text
http://localhost:5173
```

### Build Web

```bash
yarn build:web
```

Output web nằm tại:

```text
dist/
```

Khi deploy web, deploy nội dung trong thư mục `dist`.

## Chạy Desktop Electron

Dùng khi cần phát triển ứng dụng desktop.

```bash
yarn dev:desktop
```

Script này sẽ set:

- `VITE_APP_TARGET=desktop`
- `VITE_ENABLE_WEB=false`
- `VITE_ENABLE_DESKTOP=true`

Desktop dùng Electron main process trong:

```text
electron/main.ts
```

Preload script nằm tại:

```text
electron/preload.ts
```

Renderer vẫn dùng source React trong:

```text
src/
```

### Build Desktop Không Đóng Gói Installer

```bash
yarn build:desktop
```

Output Electron build nằm tại:

```text
out/
```

Trong đó:

```text
out/main/
out/preload/
out/renderer/
```

## Build Ra File `.exe` Để Cài Đặt

Dùng lệnh:

```bash
yarn dist:desktop
```

Lệnh này sẽ:

1. Build Electron source bằng `electron-vite`.
2. Đóng gói app bằng `electron-builder`.
3. Tạo installer Windows `.exe`.

Output nằm tại:

```text
release/
```

File cài đặt chính:

```text
release/CentrixG Setup 0.0.0.exe
```

Bản unpacked để test nhanh:

```text
release/win-unpacked/CentrixG.exe
```

### Đưa Installer Lên Web Để Tải Xuống

Nút tải app trên web đang trỏ tới:

```text
/downloads/CentrixG-Setup-0.0.0.exe
```

File nguồn trong project:

```text
public/downloads/CentrixG-Setup-0.0.0.exe
```

Sau khi build lại installer desktop, nếu muốn web tải bản mới nhất, copy file mới vào:

```text
public/downloads/CentrixG-Setup-0.0.0.exe
```

Sau đó build web lại:

```bash
yarn build:web
```

Kiểm tra file có mặt trong:

```text
dist/downloads/CentrixG-Setup-0.0.0.exe
```

## 2. Nguyên Tắc, Tree, Convention Code

## Nguyên Tắc Chung

- Giữ code theo đúng pattern sẵn có của project.
- Không tạo abstraction mới nếu không giảm lặp code hoặc không làm rõ logic.
- Tách rõ source web React và source Electron desktop.
- Không commit file local/secret như `.env`.
- File binary lớn như installer chỉ nên commit khi team thực sự cần web static serve trực tiếp file đó.
- Khi sửa desktop, luôn test `yarn build:desktop`; nếu có liên quan installer thì test `yarn dist:desktop`.
- Khi sửa web, luôn test `yarn build:web`.

## Project Tree Chính

```text
centrix-g-v2/
  electron/
    main.ts
    preload.ts
  public/
    downloads/
      CentrixG-Setup-0.0.0.exe
    favicon.ico
    favicon_io/
  src/
    api/
    assets/
    components/
      icons/
      neon/
      payment/
      ui/
    layout/
    mock/
    pages/
    shared/
      contanst/
      http/
      i18n/
      types/
      utils/
    App.tsx
    main.tsx
    index.css
  dist/
  out/
  release/
  electron.vite.config.ts
  vite.config.ts
  package.json
  tsconfig.json
  tsconfig.app.json
  tsconfig.node.json
```

## Ý Nghĩa Các Thư Mục

### `src/`

Source React dùng chung cho web và desktop renderer.

- `src/pages/`: các page cấp route.
- `src/components/`: component UI và component nghiệp vụ.
- `src/components/ui/`: base UI components có tính tái sử dụng.
- `src/components/icons/`: icon React/SVG.
- `src/shared/`: config, utilities, http client, types, i18n.
- `src/api/`: các hàm gọi API.
- `src/assets/`: ảnh và asset import trực tiếp vào React.

### `electron/`

Source riêng cho desktop.

- `main.ts`: Electron main process, tạo window, load renderer.
- `preload.ts`: bridge an toàn giữa renderer và Electron.

### `public/`

Static assets được Vite copy thẳng sang output web/renderer.

- Dùng cho favicon, manifest, file download public.
- File trong `public/downloads/` có thể tải qua URL `/downloads/...`.

### `dist/`

Output của web build. Không sửa tay.

### `out/`

Output của Electron build. Không sửa tay.

### `release/`

Output của Electron installer. Không sửa tay.

## Convention Code

### Naming

- Component React dùng PascalCase: `DownloadPage`, `BaseButton`.
- File component dùng PascalCase nếu export component chính.
- Utility/helper dùng camelCase.
- Constant config dùng UPPER_SNAKE_CASE hoặc object rõ nghĩa như `APP_CONFIG`.

### Import

- Ưu tiên alias `@` cho source trong `src`.
- Import shared API từ `@/shared` nếu đã được export.
- Không import sâu vào file nội bộ nếu module đã có barrel export hợp lý.

Ví dụ:

```ts
import { APP_CONFIG, BaseButton } from "@/shared";
```

### React Components

- Component nên nhỏ, rõ props, ít side effect.
- UI base component đặt trong `src/components/ui`.
- Page component đặt trong `src/pages`.
- Không để logic API phức tạp trực tiếp trong UI nếu có thể tách qua `src/api` hoặc hook/helper.

### Styling

- Project đang dùng Tailwind utility classes.
- Ưu tiên class sẵn có và pattern UI hiện tại.
- Không tạo inline style nếu Tailwind/class hiện có làm đủ.
- Button/link nên dùng `BaseButton` để giữ giao diện đồng nhất.

### Routing Web Và Desktop

`src/main.tsx` chọn router theo target:

- Web: `BrowserRouter`
- Desktop: `HashRouter`

Desktop cần `HashRouter` vì Electron load file local bằng `loadFile`.

### Electron Convention

- Electron main process không nên phụ thuộc runtime env chỉ tồn tại lúc build.
- Phần build desktop dùng `electron.vite.config.ts`.
- Main process được build ra `out/main/index.cjs`.
- `package.json` field `main` phải trỏ đúng output main process:

```json
"main": "./out/main/index.cjs"
```

### Git Convention

Không commit:

- `.env`
- `node_modules/`
- `dist/`
- `out/`
- `release/`
- log files

Có thể commit:

- `.env.example`
- source trong `src/`, `electron/`
- config build
- public assets cần cho web

### Checklist Trước Khi Push

Chạy ít nhất một lệnh build phù hợp với phần mình sửa:

```bash
yarn build:web
```

Hoặc:

```bash
yarn build:desktop
```

Nếu sửa installer/package desktop:

```bash
yarn dist:desktop
```

Kiểm tra git status:

```bash
git status --short
```

Đảm bảo không có `.env`, `dist/`, `out/`, `release/`, `node_modules/` trong danh sách file sắp commit.
