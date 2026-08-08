// Esta clase representa la entidad "Application" que se mapea a la tabla "applications" en la base de datos. Contiene campos que representan las propiedades de una aplicación de empleo, como la empresa, el título del trabajo, el estado, la fecha, entre otros. Utiliza anotaciones de JPA para definir la estructura de la tabla y Lombok para generar automáticamente los métodos getters, setters y otros métodos comunes.

package com.applyflow.backend.model;

import jakarta.persistence.*;   // Importa las anotaciones de JPA para definir la entidad y sus propiedades
import lombok.Getter;   // Genera getters
import lombok.Setter;   // Genera setters
import java.time.LocalDate; // Importa la clase LocalDate para manejar fechas sin tiempo

@Entity
@Table(name = "applications")
@Getter
@Setter
public class Application {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String company;

    @Column(name = "job_title", nullable = false)
    private String jobTitle;

    @Column(name = "platform_name")
    private String platformName;

    @Column(name = "salary_range")
    private String salaryRange;

    @Column(nullable = false)
    private String status;

    @Column(name = "application_url", columnDefinition = "TEXT")
    private String applicationUrl;

    private LocalDate date;

    @Column(name = "analysis_text", columnDefinition = "TEXT")
    private String analysisText;

    @Column(name = "cover_letter_text", columnDefinition = "TEXT")
    private String coverLetterText;

    @Column(name = "cv_adapted_text", columnDefinition = "TEXT")
    private String cvAdaptedText;

    @Column(name = "company_email")
    private String companyEmail;
}