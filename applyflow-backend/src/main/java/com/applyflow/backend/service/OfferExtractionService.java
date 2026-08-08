// Servicio que extrae los datos de una oferta de empleo a partir de su URL.
// Descarga la página (jsoup), la convierte a texto y pide a la IA (OpenRouter)
// que devuelva un JSON con: titulo, empresa, salario, plataforma y email.

package com.applyflow.backend.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.jsoup.Jsoup;
import org.jsoup.nodes.Document;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class OfferExtractionService {

    private static final Logger log = LoggerFactory.getLogger(OfferExtractionService.class);

    @Value("${openrouter.api.key}")
    private String apiKey;

    @Value("${app.openrouter.referer:http://localhost:8080}")
    private String referer;

    private static final String OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions";
    private static final int MAX_CARACTERES_OFERTA = 8000;
    private final RestTemplate restTemplate = new RestTemplate();
    private final ObjectMapper objectMapper = new ObjectMapper();

    public Map<String, String> extraerDesdeUrl(String url) {
        Map<String, String> resultado = new HashMap<>();
        try {
            Document doc = Jsoup.connect(url)
                    .userAgent("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36")
                    .timeout(15000)
                    .followRedirects(true)
                    .get();

            String texto = doc.text();
            if (texto == null || texto.isBlank()) {
                resultado.put("error", "La página de la oferta no tiene contenido de texto.");
                return resultado;
            }
            if (texto.length() > MAX_CARACTERES_OFERTA) {
                texto = texto.substring(0, MAX_CARACTERES_OFERTA);
            }

            Map<String, Object> extraido = llamarIA(texto);
            if (extraido.containsKey("error")) {
                Object error = extraido.get("error");
                resultado.put("error", error == null ? "No se pudo extraer la oferta." : error.toString());
                return resultado;
            }

            resultado.put("titulo", valor(extraido, "titulo"));
            resultado.put("empresa", valor(extraido, "empresa"));
            resultado.put("salario", valor(extraido, "salario"));
            resultado.put("plataforma", valor(extraido, "plataforma"));
            resultado.put("email", valor(extraido, "email"));
            return resultado;
        } catch (Exception e) {
            log.warn("No se pudo extraer la oferta desde la URL {}", url, e);
            resultado.put("error", "No se pudo leer la página de la oferta (algunos portales bloquean a los bots).");
            return resultado;
        }
    }

    private String valor(Map<String, Object> extraido, String clave) {
        Object valor = extraido.get(clave);
        return valor == null ? "" : valor.toString();
    }

    @SuppressWarnings("unchecked")
    private Map<String, Object> llamarIA(String textoOferta) {
        String prompt = "Analiza la siguiente oferta de empleo y extrae sus datos. "
                + "Responde ÚNICAMENTE con un objeto JSON válido, sin comentarios ni texto adicional, "
                + "con estas claves exactas: titulo, empresa, salario, plataforma, email. "
                + "Si un dato no aparece en la oferta, usa una cadena vacía \"\". "
                + "Si encuentras un email de contacto, ponlo en la clave email.\n\n"
                + "Oferta:\n" + textoOferta;

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
                        String contenido = (String) message.get("content");
                        if (contenido != null) {
                            return parsearJson(contenido);
                        }
                    }
                }
            }
        } catch (Exception e) {
            log.error("Error al conectar con OpenRouter para extraer la oferta", e);
        }
        return Map.of("error", "No se pudo conectar con el motor de IA.");
    }

    private Map<String, Object> parsearJson(String texto) {
        try {
            int inicio = texto.indexOf('{');
            int fin = texto.lastIndexOf('}');
            if (inicio == -1 || fin == -1 || fin <= inicio) {
                return Map.of("error", "La IA no devolvió un JSON válido.");
            }
            return objectMapper.readValue(texto.substring(inicio, fin + 1), Map.class);
        } catch (Exception e) {
            log.warn("La IA no devolvió un JSON parseable", e);
            return Map.of("error", "La IA no devolvió un JSON válido.");
        }
    }
}
