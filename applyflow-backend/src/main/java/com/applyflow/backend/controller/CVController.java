// Controlador REST para la generación de PDFs del CV adaptado y la extracción
// de texto de documentos .docx (para que el usuario pueda subir su CV base).

package com.applyflow.backend.controller;

import com.applyflow.backend.service.CVService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import java.util.Map;

@RestController
@RequestMapping("/api/cv")
public class CVController {

    private static final Logger log = LoggerFactory.getLogger(CVController.class);

    @Autowired
    private CVService cvService;

    @PostMapping("/generate-pdf")
    public ResponseEntity<byte[]> descargarPdf(@RequestBody Map<String, String> request) {
        String contenidoCv = request.get("contenidoCv");
        if (contenidoCv == null || contenidoCv.isEmpty()) {
            return ResponseEntity.badRequest().build();
        }

        byte[] pdfBytes = cvService.generarPdfCv(contenidoCv);  // Genera el PDF a partir del contenido del CV

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_PDF);
        headers.setContentDisposition(ContentDisposition.attachment().filename("CV_Adaptado.pdf").build());

        return new ResponseEntity<>(pdfBytes, headers, HttpStatus.OK);
    }

    @PostMapping("/extract-text")
    public ResponseEntity<String> extraerTexto(@RequestParam("file") MultipartFile file) {
        if (file == null || file.isEmpty()) {
            return ResponseEntity.badRequest().body("Debes subir un archivo .docx.");
        }

        try {
            String texto = cvService.extraerTextoDocx(file);
            if (texto == null || texto.isBlank()) {
                return ResponseEntity.badRequest().body("No se pudo extraer texto del documento.");
            }
            return ResponseEntity.ok(texto);
        } catch (Exception e) {
            log.error("Error al extraer texto del .docx", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("No se pudo extraer el texto del documento. Asegúrate de que sea un .docx válido.");
        }
    }
}
