import React from 'react';
import PDFViewer from 'pdf-viewer-reactjs';

const MenuPdf = () => {
  return (
    <div>
      <h1>PDF Viewer</h1>
      <PDFViewer
        document={{
          url: `${process.env.PUBLIC_URL}/Menu.pdf`,
        }}
      />
    </div>
  );
};
export default MenuPdf;
