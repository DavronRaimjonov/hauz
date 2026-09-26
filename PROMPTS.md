# Agent promptlari

> **Eslatma:** bu fayl to'liq eksport qilingan sessiya emas. Promptlar commit
> tarixi asosida qayta tiklangan va har biri tegishli commit'ga bog'langan.
> Asl sessiya eksporti bo'lsa, u shu fayl o'rnida yoki yonida turishi kerak.

## 1. Loyihani tushunish va sozlash

**Prompt:**

> `TASK.md` va `README.md`ni o'qib chiq. Loyiha tuzilishini, Appwrite
> Function'ning API'sini (`functions/personal-account`) va starter'dagi
> router/query sozlamalarini tushuntirib ber. Hali hech narsani o'zgartirma.
> Topshiriq qoidalariga zid yoki xavfli joy ko'rsang, alohida ayt.

**Prompt:**

> Loyihaga Tailwind CSS va shadcn/ui qo'sh. Hozircha faqat `button`
> komponenti kerak. Mavjud route'larni buzma.

Commit: `3b718ec` feat: added tailwind css and shadcn

## 2. SSR'dagi umumiy QueryClient

**Prompt:**

> `src/router.tsx`da `QueryClient` modul darajasida yaratilgan. SSR'da bu
> hamma foydalanuvchilar bitta keshni ishlatadi degani emasmi? Tekshir. Agar
> shunday bo'lsa, har bir so'rov uchun alohida client yaratadigan qilib tuzat
> va nega kerakligini kodda qisqa izoh bilan yoz.

Commit: `ad109d4` fix: create QueryClient per request instead of sharing one across SSR requests

## 3. Email kod orqali kirish

**Prompt:**

> Email kod bilan kirishni qil: email kiritiladi, kod keladi, kod kiritiladi,
> foydalanuvchi kiradi. Yangi va eski foydalanuvchi bir xil ekranlarni ko'radi.
>
> Qoidalar:
> - Appwrite'ga barcha murojaatlar TanStack Start server function'lari orqali
>   bo'lsin. API key va session secret brauzerga hech qachon tushmasin.
> - Session secret'ni `httpOnly`, `SameSite=Lax` cookie'ga yoz, production'da
>   `Secure` ham bo'lsin.
> - `src/server/appwrite.ts` server-only bo'lsin: brauzer kodi uni import qilsa
>   build xato bersin.
> - Kod kiritish uchun shadcn `input-otp`dan foydalan.

**Prompt:**

> `redirect` query parametri ko'rsatgan sahifaga yuborish open redirect
> emasmi? Faqat shu saytdagi yo'llarni qabul qiladigan `safeRedirect` yoz.
> `//evil.example` va `/\evil.example` kabi holatlarni ham hisobga ol.

**Prompt:**

> Kodlar API key bilan tekshiriladi, Appwrite esa API key bilan kelgan
> so'rovlarga rate limit qo'ymaydi. Noto'g'ri kodlar sonini chekla: 15
> daqiqada 5 ta. Yangi kod so'rash hisobni nolga tushirmasin.

Commit: `6d2b5ec` feat: sign in with an email code, session in an httpOnly cookie

## 4. Onboarding

**Prompt:**

> Personal Account'i yo'q foydalanuvchi uchun onboarding sahifasini qil: ism,
> familiya va rol (Property Owner yoki Realtor). Account faqat Function orqali
> yaratilsin, web ilova `personal_accounts` jadvaliga to'g'ridan-to'g'ri
> murojaat qilmasin. Function'ni API key bilan emas, foydalanuvchi session'i
> bilan chaqir, shunda `x-appwrite-user-id`ni Appwrite o'zi qo'shadi.

**Prompt:**

> "Continue"ni ikki marta bosish hech qachon ikkita account yaratmasligi
> kerak. Klient tomonda qanday himoya qilasan va Function tomonda bu nima
> bilan kafolatlanadi?

**Prompt:**

> Function 404 qaytarsa (account yo'q) va boshqa xato qaytarsa (Function
> ishlamayapti) holatlarini alohida ko'r. Faqat 404 bo'lsa onboarding'ga yubor.

Commit: `8c30538` feat: onboarding creates the personal account through the Function

## 5. Profil sahifasi

**Prompt:**

> `/profile` sahifasini qil: ism, familiya, contact email va bio'ni ko'rish va
> tahrirlash. Rol faqat ko'rsatilsin, o'zgartirib bo'lmasin. Contact email va
> bio ixtiyoriy: tozalansa bo'sh string emas, `null` yuborilsin. Kirmagan
> foydalanuvchi `/profile`ni ochsa, kirgandan keyin yana `/profile`ga
> qaytsin.

**Prompt:**

> Topshiriqda "profil formasi foydalanuvchi id'sini ham yuborsin" deyilgan.
> Bu xavfsizmi? Function foydalanuvchini qayerdan oladi? Xavfli bo'lsa, id
> yuborma.

Commit: `c4e60cb` feat: profile page to view and edit the personal account

## 6. Header va log out

**Prompt:**

> Har bir sahifada header bo'lsin: yoki "Sign in", yoki foydalanuvchining ismi
> va "Log out" tugmasi. Hard refresh'dan keyin birinchi paint'dayoq to'g'ri
> chiqishi kerak, shuning uchun foydalanuvchini root route'da serverda yukla.
> Log out session'ni o'chirsin va cookie'ni tozalasin.

**Prompt:**

> "Joriy foydalanuvchini yuklash har qanday sabab bilan xato bersa, cookie'ni
> o'chir" degan talab to'g'rimi? Appwrite qisqa vaqt ishlamay qolsa nima
> bo'ladi? Cookie'ni faqat 401'da o'chiradigan qil.

Commit: `99ba1bc` feat: server-rendered header with log out, onboarding redirect in root

## 7. Kodni tushunish

**Prompt:**

> `src/server/auth.ts` va `src/server/attempts.ts`ni qator-qator o'zbek tilida
> tushuntirib ber. Suhbatda agentsiz tushuntira olishim kerak.

Natija `lesson.md`ga yozildi, keyin olib tashlandi.

Commit: `6af1b77` feat: create pages onboarding signin and profile

## 8. Refaktoring

**Prompt:**

> Tiplarni `src/@types/` papkasiga yig'. Ishlatilmayotgan `useAxios` va
> `useQuery` hook'larini o'chir.

Commit: `a23855f` refactor: reorganize types and delete hooks

**Prompt:**

> Komponentlardagi mutation'larni `src/server/mutation.ts`dagi alohida
> hook'larga ko'chir. Xatti-harakat o'zgarmasin.

Commit: `2478138` refactor: move mutations into self-contained hooks in src/server/mutation.ts

**Prompt:**

> Header, onboarding va profil UI'ni kichik komponentlarga ajrat: form field,
> submit button, role picker, profile card va hokazo.

Commit: `1fc0a6d` refactor: split header, onboarding and profile UI into components

## 9. Hujjatlar

**Prompt:**

> `NOTES.md` yoz, ko'pi bilan bir sahifa: asosiy qarorlar, topshiriqning qaysi
> joylariga amal qilmaganim va nega, production uchun keyingi qadamlar.
> `README.md`dagi ishga tushirish qadamlarini yangila.

Commit: `8d31853` feat: added NOTES.md

## Agent xato qilgan va men tuzatgan 3 ta joy

<!-- Faqat haqiqatda bo'lgan holatlarni yozing, har biri tuzatilgan commit'ga havola bilan. -->

1. **TODO:** agent nima xato qildi, qanday payqadingiz. Tuzatish: `commit`
2. **TODO:** ...
3. **TODO:** ...
