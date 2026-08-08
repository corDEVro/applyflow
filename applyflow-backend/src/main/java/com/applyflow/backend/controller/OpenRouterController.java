// Controlador REST para generar documentos adaptados por la IA (OpenRouter).
// Endpoint POST /api/ai/generate con una URL o descripción de la oferta.

package com.applyflow.backend.controller;

import com.applyflow.backend.service.OpenRouterService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/ai")
public class OpenRouterController {

    @Autowired
    private OpenRouterService openRouterService;

    @PostMapping("/generate")
    public ResponseEntity<?> generarDocumentos(@RequestBody Map<String, String> request) {
        String url = request.get("url");
        String descripcion = request.get("descripcion");

        if ((url == null || url.isEmpty()) && (descripcion == null || descripcion.isEmpty())) {
            return ResponseEntity.badRequest()
                    .body("Debes proporcionar al menos una URL o la descripción de la oferta.");
        }

        Map<String, String> resultado = openRouterService.analizarYAdaptar(url, descripcion);
        return ResponseEntity.ok(resultado);
    }
}
