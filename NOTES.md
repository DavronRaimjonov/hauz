# Eslatmalar

## Asosiy qarorlar

**Appwrite'ga barcha murojaatlar serverda bo'ladi.** Brauzer faqat TanStack
Start server function'larini chaqiradi. API key ham, session secret ham
brauzerga hech qachon yetib bormaydi. Kirgandan keyin session secret'ni
`httpOnly` cookie'ga yozaman (`SameSite=Lax`, production'da `Secure` ham),
shuning uchun sahifadagi JavaScript uni o'qiy olmaydi. `src/server/appwrite.ts`
server-only deb belgilangan: brauzer kodi uni import qilsa, build xato beradi.

**Function API key bilan emas, foydalanuvchining session'i bilan chaqiriladi.**
Shunda Appwrite `x-appwrite-user-id`ni o'zi qo'shadi va Function kim
chaqirayotganini biladi. Web ilova jadvalga hech qachon to'g'ridan-to'g'ri
murojaat qilmaydi.

**Header birinchi paint'dayoq to'g'ri.** Root route foydalanuvchini va uning
Personal Account'ini sahifa render bo'lishidan oldin serverda yuklaydi. Header
ularni route context'dan o'qiydi, shuning uchun "loading" holati ham,
miltillash ham yo'q.

**Starter'dagi xatoni tuzatdim.** `QueryClient` modul darajasida bir marta
yaratilgan edi. Serverda bu hamma foydalanuvchilar bitta keshni ishlatishini
bildiradi: bir odamning ma'lumoti boshqa odamning sahifasida chiqib qolishi
mumkin edi. Men uni `getRouter()` ichida yaratadigan qildim, endi har bir
so'rov uchun yangisi bo'ladi.

**Noto'g'ri kodlar sonini cheklayman.** Kodlar API key bilan tekshiriladi,
Appwrite esa API key bilan kelgan so'rovlarga rate limit qo'ymaydi. Cheklov
bo'lmasa, kimdir serverimiz orqali million kodning hammasini sinab chiqishi
mumkin edi. Har bir foydalanuvchiga 15 daqiqada 5 ta noto'g'ri kod ruxsat
etiladi. Yangi kod so'rash hisobni nolga tushirmaydi, aks holda har bir qayta
yuborish hujumchiga yana 5 ta urinish berardi.

**"Account yo'q" va "yuklab bo'lmadi" alohida ko'riladi.** Function 404
qaytarsa, foydalanuvchi onboarding'ga yuboriladi. Boshqa sabab bilan xato
bersa, yuborilmaydi. Aks holda Function qisqa vaqt ishlamay qolganda hamma
yana onboarding'ga tushib qolardi.

**"Continue"ni ikki marta bosish.** `useRef` bayrog'i ikkinchi yuborishni
darhol to'xtatadi, saqlanayotganda tugma o'chirib qo'yiladi. Bundan tashqari,
Function'dagi unique index faqat bitta account bo'lishini kafolatlaydi.

## Topshiriqqa amal qilmagan joylarim

- **"Kirgandan keyin `redirect` parametri ko'rsatgan sahifaga yuborish."**
  Bu open redirect: `/sign-in?redirect=https://evil.example` foydalanuvchini
  kirishi bilanoq boshqa saytga yuborib yuborardi. Men faqat shu saytdagi
  yo'llarni qabul qilaman, qolganida `/`ga yuboraman.
- **"Profile formasi foydalanuvchi id'sini yuborsin."** Yubormayman. Function
  foydalanuvchini body'dan emas, session'dan oladi. Body'dagi id'ga ishonish
  boshqa odamning profilini tahrirlashga olib keladigan xatoning aynan o'zi.
- **"Joriy foydalanuvchini yuklash har qanday sabab bilan xato bersa, cookie'ni
  o'chirish."** Men cookie'ni faqat 401'da o'chiraman, chunki faqat shunda
  session haqiqatan yaroqsiz bo'ladi. Boshqa xatolarda (Appwrite ishlamayapti,
  timeout) foydalanuvchi shu so'rov uchun kirmagan ko'rinadi, lekin cookie
  saqlanadi. Qisqa uzilish hammani tizimdan chiqarib yubormasligi kerak.

Qolgan eslatmalarga qo'shildim. Rolni o'zgartirib bo'lmaydi: profil uni faqat
ko'rsatadi, Function esa `PATCH`da uni hisobga olmaydi. Contact email yoki
bio'ni tozalash bo'sh string emas, `null` yuboradi. Function'ni o'zgartirmadim.

## Production uchun keyingi qadamlar

- Noto'g'ri kodlar limitini xotiradan Redis'ga ko'chirish. Kodni qanchalik tez-tez
  so'rash mumkinligini ham email va IP bo'yicha cheklash.
- Testlar qo'shish: `safeRedirect` va profil formasi uchun unit testlar, sign-in,
  onboarding, profilni tahrirlash va log out uchun end-to-end test.
- `console.error` o'rniga xatolarni kuzatish tizimini ishlatish.
- Sahifa hydrate bo'lguncha formalarni o'chirib turish. Hozir sekin internetda
  hydration'dan oldingi bosish hech narsa qilmaydi.
- O'zbek va rus tillariga tarjima qo'shish.
