// Comunicación con el motor de IA (OpenRouter) para analizar la oferta de
// trabajo, adaptar el CV base a los requisitos de la oferta, generar una carta
// de presentación y extraer el email de contacto si aparece en la oferta.

package com.applyflow.backend.service;

import org.apache.poi.xwpf.extractor.XWPFWordExtractor;
import org.apache.poi.xwpf.usermodel.XWPFDocument;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.core.io.ClassPathResource;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.io.InputStream;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class OpenRouterService {

    private static final Logger log = LoggerFactory.getLogger(OpenRouterService.class);

    @Value("${openrouter.api.key}")
    private String apiKey;

    @Value("${app.openrouter.referer:http://localhost:8080}")
    private String referer;

    private static final String OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions";
    private final RestTemplate restTemplate = new RestTemplate();

    // Lee el CV base desde el classpath como respaldo, por si el cliente no envía uno.
    private String leerCvDesdeWord() {
        try {
            ClassPathResource resource = new ClassPathResource("templates/cv_base.docx");
            try (InputStream is = resource.getInputStream();
                 XWPFDocument document = new XWPFDocument(is);
                 XWPFWordExtractor extractor = new XWPFWordExtractor(document)) {
                return extractor.getText();
            }
        } catch (Exception e) {
            return "NOMBRE: Tu Nombre Completo\nPERFIL: Desarrollador Fullstack Junior";
        }
    }

    @SuppressWarnings("unchecked")
    public Map<String, String> analizarYAdaptar(String urlOferta, String descripcionTexto, String cvBase) {
        String contenidoOferta = (descripcionTexto != null && !descripcionTexto.isEmpty())
                ? descripcionTexto
                : urlOferta;
        String cvBaseReal = (cvBase != null && !cvBase.isBlank()) ? cvBase : leerCvDesdeWord();

        String prompt = "Actúa como un experto en reclutamiento técnico. Analiza minuciosamente la siguiente oferta:\n"
                + contenidoOferta + "\n\n"
                + "Genera una respuesta adaptada estrictamente a esta oferta, separando los bloques EXACTAMENTE con las etiquetas [ANALISIS], [CV_ADAPTADO], [CARTA] y [EMAIL].\n\n"
                + "[ANALISIS]\n"
                + "Resume en un máximo de 4 o 5 puntos clave, cortos y ultra-directos, las tecnologías obligatorias y lo que más valora la empresa. Sin introducciones. Enuméralos.\n\n"
                + "[CV_ADAPTADO]\n"
                + "Rediseña y adapta el contenido de mi Currículum Vitae Base para que se alinee perfectamente con las palabras clave de la oferta.\n"
                + "MANTÉN exactamente la misma estructura elegante, secciones y datos verídicos de mi currículum original, pero reescribiendo o destacando las tecnologías que ellos piden:\n"
                + cvBaseReal + "\n\n"
                + "[CARTA]\n"
                + "Redacta una carta de presentación de entre 250 y 300 palabras que sea persuasiva y profesional para el equipo de selección, basándote en los requisitos de la oferta.\n"
                + "Utiliza los datos de contacto y nombre del CV original para firmarla.\n\n"
                + "[EMAIL]\n"
                + "Si encuentras algún correo electrónico de contacto en el texto de la oferta, escríbelo aquí. Si no encuentras NINGÚN email, escribe únicamente la palabra: NO_ENCONTRADO.\n"
                + "NO AÑADAS ningún comentario en los puntos de [CV_ADAPTADO] ni en [CARTA], solo el texto adaptado. No añadas explicaciones, ni introducciones, ni nada más. SOLO el texto adaptado y separado por las etiquetas EXACTAS.";

        try {
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.set("Authorization", "Bearer " + apiKey);
            headers.set("HTTP-Referer", referer);
            headers.set("X-Title", "ApplyFlow");

            Map<String, Object> messageObj = Map.of("role", "user", "content", prompt);
            Map<String, Object> bodyMap = new HashMap<>();
            bodyMap.put("model", "openrouter/auto");
            bodyMap.put("messages", List.of(messageObj));

            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(bodyMap, headers);
            ParameterizedTypeReference<Map<String, Object>> responseType = new ParameterizedTypeReference<>() {
            };

            ResponseEntity<Map<String, Object>> response = restTemplate.exchange(
                    OPENROUTER_URL, HttpMethod.POST, entity, responseType);

            if (response.getStatusCode() == HttpStatus.OK && response.getBody() != null) {
                List<Map<String, Object>> choices = (List<Map<String, Object>>) response.getBody().get("choices");
                if (choices != null && !choices.isEmpty()) {
                    Map<String, Object> message = (Map<String, Object>) choices.get(0).get("message");
                    if (message != null) {
                        String textoCompleto = (String) message.get("content");
                        if (textoCompleto != null) {
                            return parsearRespuesta(textoCompleto);
                        }
                    }
                }
            }
        } catch (Exception e) {
            log.error("Error al conectar con OpenRouter", e);
        }

        return Map.of("error", "No se pudo conectar con el motor de IA en segundo plano.");
    }

    // Divide la respuesta de la IA en bloques según las etiquetas EXACTAS.
    private Map<String, String> parsearRespuesta(String texto) {
        Map<String, String> resultado = new HashMap<>();
        try {
            String textoUpper = texto.toUpperCase();
            int idxAnalisis = textoUpper.indexOf("[ANALISIS]");
            int idxCv = textoUpper.indexOf("[CV_ADAPTADO]");
            int idxCarta = textoUpper.indexOf("[CARTA]");
            int idxEmail = textoUpper.indexOf("[EMAIL]");

            String analisis = "";
            if (idxAnalisis != -1 && idxCv != -1 && idxAnalisis < idxCv) {
                analisis = texto.substring(idxAnalisis + 10, idxCv).trim();
            } else {
                analisis = texto;
            }

            String cvAdaptado = (idxCv != -1 && idxCarta != -1 && idxCv < idxCarta)
                    ? texto.substring(idxCv + 13, idxCarta).trim() : "";
            String carta = (idxCarta != -1 && idxEmail != -1 && idxCarta < idxEmail)
                    ? texto.substring(idxCarta + 7, idxEmail).trim() : "";
            String email = (idxEmail != -1) ? texto.substring(idxEmail + 7).trim() : "";

            if (email.equalsIgnoreCase("NO_ENCONTRADO") || email.isEmpty()) {
                email = "";
            }

            resultado.put("analisis", analisis);
            resultado.put("cvAdaptado", cvAdaptado);
            resultado.put("cartaPresentacion", carta);
            resultado.put("email", email);
        } catch (Exception e) {
            log.warn("Respuesta de la IA en formato inesperado", e);
            resultado.put("analisis", texto);
            resultado.put("cvAdaptado", "");
            resultado.put("cartaPresentacion", "");
            resultado.put("email", "");
        }
        return resultado;
    }
}
