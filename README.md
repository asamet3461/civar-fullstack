# Civar

Civar, mahalle tabanlı bir haberleşme uygulamasıdır. Kullanıcılar kayıt olurken kendi mahallelerini seçer ve bulundukları mahalle grubuna dahil olurlar. Sistem, mahalle içindeki kullanıcılar arasında etkin haberleşmeyi, etkinlik oluşturmayı ve bildirim almayı sağlar.

Canlı demo: [Civar Uygulaması](https://gray-beach-008621c03.1.azurestaticapps.net)

## Özellikler

- **Mahalle Bazlı Kayıt ve Gruplar**  
  Kullanıcılar kayıt sırasında mahallelerini seçer ve aynı mahalledeki kullanıcılarla toplu veya birebir mesajlaşabilirler.

- **Etkinlik ve Post Paylaşımı**  
  Mahalleye özel etkinlikler ve gönderiler (post/event) oluşturulabilir; tüm mahalle kullanıcıları bu paylaşımları görebilir.

- **Site İçi Bildirim Sistemi**  
  - Mesaj geldiğinde  
  - Mahalleye yeni bir kullanıcı katıldığında  
  - Etkinlik/post oluşturulduğunda  
  Kullanıcılara site içi bildirimler iletilir.

- **E-posta Bildirimleri**  
  Bildirimler RabbitMQ (CloudAMQP) ile kuyruklanır ve Google Mail entegrasyonu kullanılarak kullanıcılara e-posta olarak iletilir.

- **Site Güvenliği ve Giriş**  
  - JWT tabanlı kullanıcı kimlik doğrulama sistemi  
  - Google hesabı ile giriş imkanı

- **Redis Entegrasyonu**  
  - Rate limit uygulamaları için Upstash Redis kullanılır  
  - Kullanıcıların online/offline durumu Redis üzerinden takip edilir ve sitede gösterilir

- **Şifre Sıfırlama**  
  “Şifremi unuttum” işlemleri RabbitMQ (CloudAMQP) üzerinden işlenir

- **Sistem Takibi ve Veri Doğrulama**  
  - İşlemler AuditLog ile kaydedilir  
  - Veri doğrulama FluentValidation ile yapılır

- **Gerçek Zamanlı Mesajlaşma**  
  SignalR ile mahalle içi ve birebir mesajlaşma gerçekleştirilir

## Azure Üzerindeki Yapı

- **App Service:** `civarapi`  
- **Statik Web Uygulaması:** `civar-frontend`  
- **PostgreSQL:** `civardb` (Azure Veritabanı Esnek Sunucusu)  
- **Kaynak Grubu:** `civarapi_group`  

## Kullanılan Teknolojiler

- .NET (C#)  
- React  
- JavaScript  
- Redis (Upstash)  
- RabbitMQ (CloudAMQP)  
- PostgreSQL (Azure)  
- JWT Authentication  
- Google Auth  
- SignalR  
- FluentValidation  
- AuditLog
- Azure

---

Civar, mahalle bazlı hızlı, güvenli ve kapsamlı bir iletişim platformu sunmak üzere geliştirilmiştir.
