import React from 'react';

// STİL OBJELERİ ARTIK BURADA, COMPONENT'İN DIŞINDA TANIMLANIYOR
// Bu, Next.js'in build sürecinin kafasının karışmasını engeller.

const mainStyle = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'flex-start',
  width: '100%',
  minHeight: 'calc(100vh - 160px)',
  padding: '8rem 1.5rem 4rem 1.5rem',
};

const contentWrapperStyle = {
  maxWidth: '700px',
  width: '100%',
  textAlign: 'center',
};

const titleStyle = {
  fontSize: '2.8rem',
  fontWeight: '600',
  marginBottom: '1rem',
};

const subtitleStyle = {
  fontSize: '1.2rem',
  marginBottom: '3.5rem',
  color: '#4a5568',
};

const contactDetailsStyle = {
  fontSize: '1.15rem',
  lineHeight: '2.2',
};


// COMPONENT FONKSİYONU ŞİMDİ DAHA TEMİZ VE SADECE GÖRÜNÜMÜ OLUŞTURUYOR
const IletisimPage = () => {
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
