// Esta clase es un servicio que maneja la lógica de negocio relacionada con las aplicaciones de empleo. Proporciona métodos para obtener todas las aplicaciones, guardar una nueva aplicación y actualizar el estado de una aplicación específica. Utiliza el repositorio de aplicaciones para interactuar con la base de datos y realizar las operaciones necesarias.

package com.applyflow.backend.service;

import com.applyflow.backend.model.Application;
import com.applyflow.backend.repository.ApplicationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.time.LocalDate;
import java.util.List;

@Service
public class ApplicationService {

    @Autowired
    private ApplicationRepository applicationRepository;
    // Método para obtener todas las aplicaciones de empleo
    public List<Application> getAllApplications() {
        return applicationRepository.findAll();
    }
    // Método para guardar una nueva aplicación de empleo. Si la fecha no se proporciona, se establece la fecha actual.
    public Application saveApplication(Application application) {
        if (application.getDate() == null) {
            application.setDate(LocalDate.now());
        }
        return applicationRepository.save(application);
    }
    // Método para actualizar el estado de una aplicación de empleo específica. Devuelve true si la actualización fue exitosa, o false si la aplicación no se encuentra.
    public boolean updateApplicationStatus(Long id, String newStatus) {
        int rows = applicationRepository.updateStatus(id, newStatus);
        return rows > 0;
    }
}