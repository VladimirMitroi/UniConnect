package com.uniconnect.backendcore.config; // Schimbă pachetul dacă e nevoie

import org.springframework.amqp.core.Binding;
import org.springframework.amqp.core.BindingBuilder;
import org.springframework.amqp.core.DirectExchange;
import org.springframework.amqp.core.Queue;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class RabbitMQConfig {

    // Numele pe care le folosesc și Java, și Python
    public static final String QUEUE_NAME = "course_queue";
    public static final String EXCHANGE_NAME = "course_exchange";
    public static final String ROUTING_KEY = "course_routing_key";

    // 1. Creăm "Cutia poștală" (Coada)
    @Bean
    public Queue queue() {
        // "true" înseamnă că supraviețuiește chiar dacă pică serverul RabbitMQ
        return new Queue(QUEUE_NAME, true);
    }

    // 2. Creăm "Ghișeul" (Exchange-ul) pe care nu-l găsea Java
    @Bean
    public DirectExchange exchange() {
        return new DirectExchange(EXCHANGE_NAME);
    }

    // 3. Legăm Cutia poștală de Ghișeu folosind adresa (Routing Key)
    @Bean
    public Binding binding(Queue queue, DirectExchange exchange) {
        return BindingBuilder.bind(queue).to(exchange).with(ROUTING_KEY);
    }
}