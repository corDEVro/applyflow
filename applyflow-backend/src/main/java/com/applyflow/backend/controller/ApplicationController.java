// Esta clase es un controlador REST para manejar las solicitudes relacionadas con las aplicaciones de empleo. Proporciona endpoints para obtener todas las aplicaciones, crear una nueva aplicación y actualizar el estado de una aplicación específica. Utiliza el servicio de aplicaciones para realizar las operaciones necesarias en la base de datos y devuelve respuestas adecuadas según el resultado de cada operación.

package com.applyflow.backend.controller;

import com.applyflow.backend.model.Application;
import com.applyflow.backend.service.ApplicationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import org.springframework.http.ResponseEntity;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/applications")
public class ApplicationController {

    @Autowired  // Inyecta la dependencia del servicio de aplicaciones
    private ApplicationService applicationService;

    @GetMapping // Maneja solicitudes GET para obtener todas las aplicaciones
    public List<Application> getAllApplications() {
        return applicationService.getAllApplications();
    }

    @PostMapping    // Maneja solicitudes POST para crear una nueva aplicación
    public Application createApplication(@RequestBody Application application) {
        return applicationService.saveApplication(application);
    }

    @PatchMapping("/{id}/status")   // Maneja solicitudes PATCH para actualizar el estado de una aplicación específica
    public ResponseEntity<?> updateStatus(@PathVariable Long id, @RequestBody Map<String, String> body) {   // Obtiene el nuevo estado del cuerpo de la solicitud
        String newStatus = body.get("status");
        
        if (newStatus == null || newStatus.isEmpty()) {
            return ResponseEntity.badRequest().body("El campo 'status' es obligatorio");
        }

        boolean updated = applicationService.updateApplicationStatus(id, newStatus);    // Actualiza el estado de la aplicación y obtiene el resultado

        if (updated) {  // Si la actualización fue exitosa, devuelve una respuesta con un mensaje de éxito y los detalles de la aplicación actualizada
            return ResponseEntity.ok(Map.of(
                "message", "Estado actualizado con éxito",
                "id", id,
                "status", newStatus
            ));
        } else {
            return ResponseEntity.notFound().build();   // Si la aplicación no se encuentra, devuelve una respuesta 404 Not Found
        }
    }
}