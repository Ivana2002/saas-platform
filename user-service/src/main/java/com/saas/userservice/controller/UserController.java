package com.saas.userservice.controller;

import com.saas.userservice.dto.UserDTO;
import com.saas.userservice.model.User;
import com.saas.userservice.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/users")
@CrossOrigin(origins = "*", allowedHeaders = "*")
public class UserController {

    @Autowired
    private UserService service;

    @PostMapping("/create-admin")
    public User createAdminUser(@RequestParam String schema, @RequestParam String email) {
        return service.createAdminUser(schema, email);
    }

    @PostMapping
    public User createUser(@RequestBody UserDTO dto) {
        return service.createUser(dto);
    }

    @GetMapping
    public List<User> getAllUsers() {
        return service.getAllUsers();
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody UserDTO loginReq) {
        // 1. Traženje korisnika u šemi na osnovu unesenog emaila
        User user = service.getAllUsers().stream()
                .filter(u -> u.getEmail().equalsIgnoreCase(loginReq.getEmail()))
                .findFirst()
                .orElse(null);

        // 2. Ako korisnik ne postoji u toj šemi
        if (user == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("message", "Korisnik sa navedenim emailom ne postoji u ovoj šemi."));
        }

        // 3. Provjera lozinke
        if (user.getPassword() != null && user.getPassword().equals(loginReq.getPassword())) {
            return ResponseEntity.ok(user);
        } else {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("message", "Pogrešna lozinka."));
        }
    }

    // --- METODA ZA BRISANJE ---
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteUser(@PathVariable Long id) {
        service.deleteUser(id);
        return ResponseEntity.ok().build();
    }

    // --- METODA ZA AŽURIRANJE ---
    @PutMapping("/{id}")
    public ResponseEntity<?> updateUser(@PathVariable Long id, @RequestBody UserDTO dto) {
        User updatedUser = service.updateUser(id, dto);
        return ResponseEntity.ok(updatedUser);
    }
}