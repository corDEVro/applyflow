package com.applyflow.backend.service;

import org.junit.jupiter.api.Test;

import java.nio.charset.StandardCharsets;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertTrue;

class CVServiceTest {

    private final CVService cvService = new CVService();

    @Test
    void generarPdfCvDevuelveUnPdfValido() {
        String contenidoCv = "# Tu Nombre Completo\n"
                + "## EXPERIENCIA\n"
                + "- Desarrollador Fullstack en ABC (2023-2026)\n"
                + "## EDUCACIÓN\n"
                + "- Grado en Ingeniería Informática\n";

        byte[] pdf = cvService.generarPdfCv(contenidoCv);

        assertNotNull(pdf);
        assertTrue(pdf.length > 0, "El PDF no debería estar vacío");
        String firma = new String(pdf, 0, 5, StandardCharsets.US_ASCII);
        assertEquals("%PDF-", firma, "El byte inicial debe ser la firma PDF");
    }
}
