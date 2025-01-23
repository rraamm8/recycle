package com.project.controller;

import java.util.List;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.project.domain.ResultDTO;
import com.project.service.ResultService;

@RestController
@RequestMapping("/api/detections")
public class ResultController {
    private final ResultService resultService;

    public ResultController(ResultService resultService) {
        this.resultService = resultService;
    }

    @GetMapping("/result")
    public List<ResultDTO> getDetectionReport() {
        return resultService.getDetectionReport();
    }
}