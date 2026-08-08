// Este archivo define el repositorio de aplicaciones, que es responsable de interactuar con la base de datos para realizar operaciones CRUD relacionadas con las aplicaciones. Utiliza Spring Data JPA para simplificar el acceso a los datos y proporciona un método personalizado para actualizar el estado de una aplicación específica.

package com.applyflow.backend.repository;

import com.applyflow.backend.model.Application;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

@Repository
public interface ApplicationRepository extends JpaRepository<Application, Long> {

    @Modifying
    @Transactional
    @Query("UPDATE Application a SET a.status = :status WHERE a.id = :id")
    int updateStatus(@Param("id") Long id, @Param("status") String status);
}