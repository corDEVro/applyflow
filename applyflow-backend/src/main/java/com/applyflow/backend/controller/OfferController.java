// Controlador REST para extraer los datos de una oferta de empleo desde su URL.

package com.applyflow.backend.controller;

import com.applyflow.backend.service.OfferExtractionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/offer")
public class OfferController {

    @Autowired
    private OfferExtractionService offerExtractionService;

    @PostMapping("/extract")
    public ResponseEntity<Map<String, String>> extraer(@RequestBody Map<String, String> request) {
        String url = request.get("url");
        if (url == null || url.isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("error", "La URL de la oferta es obligatoria."));
        }

        Map<String, String> resultado = offerExtractionService.extraerDesdeUrl(url.trim());
        return ResponseEntity.ok(resultado);
    }
}
