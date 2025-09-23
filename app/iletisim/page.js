import React from 'react';
// Stil dosyası için (opsiyonel ama önerilir)
// import styles from './iletisim.module.scss'; 

const IletisimPage = () => {
  return (
    // ÖNEMLİ: Header ve Footer'ı buraya eklemenize GEREK YOKTUR.
    // Ana layout dosyanız (app/layout.js) bunu tüm sayfalar için otomatik olarak yapar.
    <main>
      <section style={{ padding: '40px 20px', minHeight: '70vh', textAlign: 'center' }}>
        <h1>İletişim</h1>
        <p>Bizimle iletişime geçmek için aşağıdaki bilgileri kullanabilirsiniz.</p>
        
        <div style={{ marginTop: '30px', lineHeight: '1.8' }}>
          <p><strong>E-posta:</strong> bilgi@ardiyesizgiris.com</p>
          <p><strong>Telefon:</strong> +90 123 456 78 90</p>
          <p><strong>Adres:</strong> Örnek Mah. Test Sk. No:1, İstanbul</p>
        </div>
        
        {/* İleride buraya bir iletişim formu bileşeni ekleyebiliriz. */}
      </section>
    </main>
  );
};

export default IletisimPage;
