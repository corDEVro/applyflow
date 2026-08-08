// Esta clase es un controlador REST para manejar las solicitudes relacionadas con la generación de CVs en formato PDF y el envío de correos electrónicos con los CVs adaptados. Proporciona endpoints para generar un PDF a partir del contenido del CV y para enviar un correo electrónico con el CV adaptado. Utiliza el servicio de CV para realizar las operaciones necesarias y devuelve respuestas adecuadas según el resultado de cada operación.

package com.applyflow.backend.controller;

import com.applyflow.backend.service.CVService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import java.util.Map;

@RestController
@RequestMapping("/api/cv")
public class CVController {

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

    @PostMapping("/send-email")
    public ResponseEntity<?> enviarCandidatura(@RequestBody Map<String, String> request) {  // Maneja solicitudes POST para enviar un correo electrónico con el CV adaptado
        String destinatario = request.get("destinatario");
        String cuerpoEmail = request.get("cuerpoEmail");
        String contenidoCv = request.get("contenidoCv");

        if (destinatario == null || destinatario.isEmpty()) {
            return ResponseEntity.badRequest().body("El email del destinatario es obligatorio.");
        }

        try {
            cvService.enviarCandidatura(destinatario, cuerpoEmail, contenidoCv);
            return ResponseEntity.ok(Map.of("message", "Correo electrónico enviado con éxito."));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error al procesar o despachar el correo electrónico: " + e.getMessage());
        }
    }
}