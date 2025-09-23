export default IletisimPage;


import React from 'react';

// Bu bir JavaScript component'idir ve stiller doğrudan içine yazılmıştır.
const IletisimPage = () => {

  // Sayfanın ana yerleşimini düzenleyen stil objesi
  // Header'ın altında kalma sorununu 'padding' ile çözer
  const mainStyle = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'flex-start',
    width: '100%',
    minHeight: 'calc(100vh - 160px)', // Footer'ı aşağıda tutar
    padding: '8rem 1.5rem 4rem 1.5rem', // Üstten 8rem boşluk Header sorununu çözer
  };

  // İçeriği saran ve genişliğini sınırlayan stil
  const contentWrapperStyle = {
    maxWidth: '700px',
    width: '100%',
    textAlign: 'center',
  };

  // Ana başlık stili
  const titleStyle = {
    fontSize: '2.8rem',
    fontWeight: '600',
    marginBottom: '1rem',
  };

  // Alt başlık stili
  const subtitleStyle = {
    fontSize: '1.2rem',
    marginBottom: '3.5rem',
    color: '#4a5568', // Sitenizdeki renklere benzer bir ton
  };

  // İletişim detayları stili
  const contactDetailsStyle = {
    fontSize: '1.15rem',
    lineHeight: '2.2',
  };

  return (
    <main style={mainStyle}>
      <div style={contentWrapperStyle}>
        <h1 style={titleStyle}>
          İletişim
        </h1>
        <p style={subtitleStyle}>
          Bizimle iletişime geçmek için aşağıdaki bilgileri kullanabilirsiniz.
        </p>
        
        <div style={contactDetailsStyle}>
          <p>
            <strong>E-posta:</strong> info@ardiyesizgiris.com
          </p>
          <p>
            <strong>Telefon:</strong> +90 123 456 78 90
          </p>
          <p>
            <strong>Adres:</strong> Örnek Mah. Test Sk. No:1, İstanbul
          </p>
        </div>
      </div>
    </main>
  );
};

export default IletisimPage;
