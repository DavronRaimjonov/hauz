# Dars: `auth.ts` va `attempts.ts`

Suhbatda agentsiz tushuntirish uchun. Qator raqamlari hozirgi fayllarga mos.

---

## 0. Umumiy rasm

```
Brauzer (sign-in sahifasi)
   │  requestEmailCode({ data: { email } })
   │  verifyEmailCode({ data: { userId, code } })
   ▼
Bizning server: src/server/auth.ts        ← server function'lar
   │  createAdminClient()  (API key)
   │  createSessionClient(secret)  (foydalanuvchi session'i)
   ▼
Appwrite Cloud (Auth)
```

- Brauzer Appwrite bilan **to'g'ridan-to'g'ri gaplashmaydi**, faqat bizning server function'larimizni chaqiradi.
- API key va session secret **faqat serverda** turadi. Topshiriq qoidasi: *"Browser JavaScript must never be able to read the Appwrite session secret or any API key."*
- Session secret `httpOnly` cookie'da saqlanadi. Brauzer cookie'ni har so'rovda o'zi yuboradi, lekin JS (`document.cookie`) uni **o'qiy olmaydi**.

---

## 1. `src/server/auth.ts`

Uchta server function bor: **kod so'rash**, **kodni tekshirish** va **joriy foydalanuvchi**.

### `createServerFn` nima?

TanStack Start'ning funksiyasi. Kod **serverda** ishlaydi, lekin brauzerdan oddiy funksiya kabi chaqiriladi:

```ts
await requestEmailCode({ data: { email: 'a@b.com' } })
```

TanStack Start uni o'zi HTTP so'rovga aylantiradi. axios ham, URL ham kerak emas, argument va javob esa tiplangan bo'ladi. Build paytida `.handler(...)` ichidagi kod brauzer bundle'idan **olib tashlanadi**, shuning uchun API key brauzerga tushmaydi.

### `.validator(...)` nima?

Brauzerdan kelgan ma'lumotni **serverda** zod bilan tekshiradi. Brauzerga ishonib bo'lmaydi: foydalanuvchi so'rovni qo'lda yasab, istalgan narsani yuborishi mumkin. Tekshiruvdan o'tmagan so'rov handler'ga yetib bormaydi.

### `Result` tipi (19-qator)

```ts
type Result<T = void> = { ok: true; data: T } | { ok: false; message: string }
```

Xatoni `throw` qilish o'rniga **qiymat sifatida qaytaramiz**. Buning ikki sababi bor:

- Kutilgan xatolar (noto'g'ri kod, ko'p urinish) oddiy holat, istisno emas. UI `result.ok` ni tekshirib, xabarni ko'rsatadi.
- Foydalanuvchiga **faqat biz yozgan xabar** boradi. Appwrite'ning ichki xato matni yoki stack trace brauzerga chiqib ketmaydi. Function kodida ham xuddi shu prinsip bor: Appwrite xato matnida API key uchrashi kuzatilgan.

### 1.1 `requestEmailCode` (21–41-qatorlar): kod so'rash

1. `validator`: `email` haqiqiy email bo'lishi shart (22-qator).
2. `createAdminClient()`: **API key** bilan ishlaydigan client (24-qator).
3. `account.createEmailToken({ userId: ID.unique(), email })` (27-qator): Appwrite emailga 6 xonali kod yuboradi.
4. `token.userId` qaytariladi (32-qator). Kod tekshirilayotganda shu id kerak bo'ladi.

**Suhbatda so'ralishi mumkin:** *"Yangi va eski foydalanuvchini qanday ajratasiz?"*
- **Ajratmaymiz**, ikkalasi bir xil ekranlardan o'tadi (topshiriq talabi).
- Appwrite o'zi hal qiladi. Email **yangi** bo'lsa, biz bergan `ID.unique()` bilan yangi user yaratiladi. Email **mavjud** bo'lsa, biz bergan id e'tiborsiz qoldiriladi va **mavjud userning id'si** qaytadi.
- Shuning uchun `ID.unique()` emas, `token.userId` qaytariladi.

**Nega xatoda umumiy xabar (36–39-qatorlar)?** Appwrite xatosi server log'iga yoziladi (`console.error`), foydalanuvchiga esa faqat "try again" boradi. Ichki tafsilotlar brauzerga chiqmaydi.

### 1.2 `verifyEmailCode` (43–86-qatorlar): kodni tekshirish va login

1. `validator` (44–49-qatorlar): `userId` 1–36 belgi (Appwrite id'si maksimal 36), `code` aynan 6 ta raqam (`/^\d{6}$/`).
2. **Avval limit tekshiriladi** (51-qator): `tooManyAttempts(userId)`. Juda ko'p xato bo'lgan bo'lsa, Appwrite'ga umuman murojaat qilinmaydi.
3. `account.createSession({ userId, secret: code })` (63-qator): Appwrite kodni tekshiradi va session yaratadi.
4. **Muvaffaqiyatli bo'lsa:**
   - `resetAttempts` (68-qator): xatolar hisobi tozalanadi.
   - `setSessionCookie(session.secret, new Date(session.expire))` (69-qator): secret `httpOnly` cookie'ga yoziladi. Cookie Appwrite session'i tugagan vaqtda o'zi ham o'chadi.
5. **Xato bo'lsa:**
   - **401** (73-qator): kod noto'g'ri yoki muddati o'tgan. `recordFailedAttempt` bilan urinish yozib qo'yiladi.
   - **Boshqa xato** (Appwrite ishlamayapti va hokazo): log'ga yoziladi, umumiy xabar qaytadi. Bu **urinish sifatida hisoblanmaydi**, chunki foydalanuvchining aybi yo'q.

**Muhim savol:** *"Nega `createSession` API key bilan chaqiriladi?"*
- API key bilan chaqirilgandagina javobda **`session.secret`** keladi.
- Bizga aynan shu secret kerak: uni cookie'ga yozamiz va keyin `createSessionClient(secret)` bilan foydalanuvchi nomidan ishlaymiz.
- API key'siz chaqirilsa, Appwrite session'ni o'z domenidagi cookie'ga yozadi va bizning serverimiz secret'ni ko'rmaydi.

**Muhim savol:** *"Cookie sozlamalari nima uchun?"* (`src/server/appwrite.ts`)

| Sozlama | Nima uchun |
|---|---|
| `httpOnly: true` | JS cookie'ni o'qiy olmaydi. XSS bo'lsa ham secret o'g'irlanmaydi |
| `secure: true` (production'da) | Cookie faqat HTTPS orqali yuboriladi |
| `sameSite: 'lax'` | Boshqa saytdan yuborilgan POST so'rovlariga cookie qo'shilmaydi (CSRF'dan himoya) |
| `path: '/'` | Butun saytda amal qiladi |
| `expires` | Appwrite session'i bilan bir vaqtda tugaydi |

### 1.3 `getCurrentUser` (96–117-qatorlar): kim kirgan?

1. Cookie'dan secret o'qiladi (98-qator). Cookie yo'q bo'lsa, `null` qaytadi: foydalanuvchi kirmagan.
2. `createSessionClient(secret).account.get()` (104-qator): Appwrite'dan **shu session egasi** so'raladi.
3. Faqat `{ id, email }` qaytariladi (106-qator). Brauzerga keragidan ortiq ma'lumot yuborilmaydi.
4. **Xato bo'lsa:**
   - **401**: session yaroqsiz (muddati o'tgan yoki o'chirilgan), shuning uchun cookie **o'chiriladi** (109-qator).
   - **Boshqa xato**: cookie **qoldiriladi**, log'ga yoziladi va `null` qaytadi.

**Topshiriqdagi tuzoq, bu yerda men rozi bo'lmagan joy:**

> *"If loading the current user fails for any reason, treat the person as signed out. Delete the session cookie and show sign-in."*

- "Any reason" noto'g'ri. Appwrite 2 soniya ishlamay qolsa yoki timeout bo'lsa, **hamma foydalanuvchilar logout bo'lib ketadi**, garchi ularning session'lari hali yaroqli bo'lsa ham.
- **Mening qarorim:** cookie faqat **401**da o'chiriladi, chunki 401 "session haqiqatan tugagan" degani. Boshqa xatolarda foydalanuvchi **shu so'rov uchun** kirmagan ko'rinadi, lekin cookie saqlanadi. Appwrite tiklangach, foydalanuvchi yana tizimda bo'ladi.
- Bu qaror `NOTES.md`da ham yoziladi.

**Qayerda chaqiriladi:** `src/routes/__root.tsx`dagi `beforeLoad`. U har sahifadan oldin, birinchi so'rovda esa **serverda** ishlaydi. Shu sababli sahifa birinchi paint'dayoq kim kirganini biladi (header talabi).

---

## 2. `src/server/attempts.ts`: noto'g'ri kodlar chegarasi

### Muammo

- Kod 6 xonali, ya'ni 1 000 000 variant.
- Oddiy holatda Appwrite ko'p noto'g'ri urinishni **rate limit** bilan to'xtatadi.
- Lekin **API key bilan kelgan so'rovlarga Appwrite rate limit qo'ymaydi**. Bu server SDK'lari uchun qilingan.
- Biz `createSession`ni API key bilan chaqiramiz. Demak himoya bo'lmasa, hujumchi bizning serverimiz orqali kodlarni **cheksiz terib chiqishi** mumkin edi. Buning uchun unga faqat qurbonning `userId`si kerak, u esa `requestEmailCode` javobidan olinadi.

### Yechim: vaqt oynasidagi limit

```ts
const MAX_FAILURES = 5                 // 3-qator
const WINDOW_MS = 15 * 60 * 1000       // 4-qator: 15 daqiqa
const failures = new Map<string, number[]>()   // 6-qator: userId → xato vaqtlari
```

**Oxirgi 15 daqiqada 5 ta noto'g'ri koddan keyin** shu user uchun tekshiruv to'xtaydi.

### Funksiyalar

- **`recent(userId)` (8–19-qatorlar):** userning **oxirgi 15 daqiqadagi** xato vaqtlarini qaytaradi.
  - Eski vaqtlar `filter` bilan tashlab yuboriladi (10-qator).
  - Ro'yxat bo'sh qolsa, user `Map`dan o'chiriladi (15-qator), aks holda xotira keraksiz yozuvlar bilan to'lib boradi.
- **`tooManyAttempts(userId)` (21–23-qatorlar):** xatolar soni 5 yoki undan ko'p bo'lsa, `true`.
- **`recordFailedAttempt(userId)` (25–27-qatorlar):** hozirgi vaqtni ro'yxatga qo'shadi.
- **`resetAttempts(userId)` (29–31-qatorlar):** **faqat muvaffaqiyatli login'da** chaqiriladi va hisobni tozalaydi.

### Nega vaqt oynasi, oddiy hisoblagich emas?

- Oddiy hisoblagich bo'lsa, user 5 marta xato qilgach **abadiy bloklanib qoladi**.
- Vaqt oynasi bilan 15 daqiqa o'tgach eski xatolar o'z-o'zidan "eskiradi" va user yana urinib ko'ra oladi.

### Nega yangi kod so'ralganda hisob tozalanmaydi? (muhim)

- Birinchi versiyada `requestEmailCode` ichida `resetAttempts` bor edi, keyin **olib tashladim**.
- Sababi: hujumchi 5 ta kodni sinaydi, yangi kod so'raydi (hisob 0 ga tushadi), yana 5 ta sinaydi va hokazo. Bunda limitdan foyda qolmaydi.
- Endi yangi kod so'rash limitni **tozalamaydi**.

### Cheklovlari (suhbatda o'zingiz aytsangiz, yaxshi taassurot qoldiradi)

- **Xotirada (`Map`) saqlanadi:** server qayta ishga tushsa, hisob yo'qoladi.
- **Faqat bitta server jarayoni uchun ishlaydi.** Production'da bir nechta server bo'lsa, har birida alohida hisob bo'ladi.
- **Production'da** buni **Redis** kabi umumiy joyda saqlash kerak.
- Kod **so'rash** (email yuborish) hali cheklanmagan. Hujumchi birovning emailiga ko'p kod yuborishi mumkin. Keyingi qadam: email yoki IP bo'yicha cooldown.
- `import '@tanstack/react-start/server-only'` (1-qator): bu fayl tasodifan brauzer kodidan import qilinsa, build xato beradi.

---

## 3. Suhbatda berilishi mumkin savollar

**S: Session secret qayerda saqlanadi, nega `localStorage`da emas?**
J: `httpOnly` cookie'da. `localStorage`ni har qanday JS o'qiy oladi, shuning uchun XSS bo'lsa token o'g'irlanadi. `httpOnly` cookie'ni JS umuman ko'rmaydi. Topshiriq ham shuni talab qiladi.

**S: Nega brauzer Appwrite'ga o'zi murojaat qilmaydi?**
J: Unda session secret brauzerda bo'lishi kerak bo'lardi. Bundan tashqari, sahifa serverda render bo'lganda header'dagi ism birinchi paint'da chiqishi uchun server foydalanuvchini bilishi kerak.

**S: Hujumchi boshqa odamning `userId`sini yuborsa nima bo'ladi?**
J: U baribir o'sha odamning emailiga kelgan kodni bilishi kerak. Kodni taxmin qilishni esa `attempts.ts` 15 daqiqada 5 ta urinish bilan cheklaydi.

**S: `verifyEmailCode`da nega faqat 401 urinish sifatida hisoblanadi?**
J: 401 "kod noto'g'ri" degani. 500 yoki timeout foydalanuvchining aybi emas. Ularni hisoblasak, Appwrite ishlamay turgan paytda odamlar bekorga bloklanib qolardi.

**S: `getCurrentUser` xato bersa nima bo'ladi?**
J: 401 bo'lsa, cookie o'chiriladi va foydalanuvchi kirmagan hisoblanadi. Boshqa xatoda cookie saqlanadi, shu so'rov uchun esa foydalanuvchi kirmagan ko'rinadi. Topshiriqdagi "any reason" talabiga ataylab to'liq amal qilmadim: qisqa uzilish hammani logout qilib yubormasligi kerak.

**S: Limitni qanday yaxshilaysiz?**
J: Redis'ga ko'chiraman, kod so'rashga ham cooldown qo'shaman (email yoki IP bo'yicha). Yana bir variant: har bir token uchun alohida urinish hisobi.

**S: Nega xatolar `throw` emas, `{ ok: false, message }` qilib qaytariladi?**
J: Noto'g'ri kod kutilgan holat, istisno emas. UI uni oddiy tekshiradi. Brauzerga faqat biz yozgan xabar boradi, Appwrite'ning ichki xato matni chiqmaydi.
