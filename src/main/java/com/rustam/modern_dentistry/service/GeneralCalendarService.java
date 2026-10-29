package com.rustam.modern_dentistry.service;

import com.rustam.modern_dentistry.dao.entity.GeneralCalendar;
import com.rustam.modern_dentistry.dao.entity.settings.AppointmentType;
import com.rustam.modern_dentistry.dao.entity.settings.Cabinet;
import com.rustam.modern_dentistry.dao.entity.users.BaseUser;
import com.rustam.modern_dentistry.dao.entity.users.Patient;
import com.rustam.modern_dentistry.dao.repository.GeneralCalendarRepository;
import com.rustam.modern_dentistry.dto.request.create.AppointmentTypeRequestId;
import com.rustam.modern_dentistry.dto.request.create.NewAppointmentRequest;
import com.rustam.modern_dentistry.dto.request.update.UpdateAppointmentRequest;
import com.rustam.modern_dentistry.dto.response.create.NewAppointmentResponse;
import com.rustam.modern_dentistry.dto.response.read.*;
import com.rustam.modern_dentistry.exception.custom.DoctorIsPatientsWereNotFound;
import com.rustam.modern_dentistry.exception.custom.ExistsException;
import com.rustam.modern_dentistry.exception.custom.NoSuchPatientWasFound;
import com.rustam.modern_dentistry.mapper.GeneralCalendarMapper;
import com.rustam.modern_dentistry.service.settings.AppointmentTypeService;
import com.rustam.modern_dentistry.service.settings.CabinetService;
import com.rustam.modern_dentistry.util.UtilService;
import jakarta.transaction.Transactional;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalTime;
import com.rustam.modern_dentistry.dao.entity.enums.status.Appointment;
import java.util.List;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class GeneralCalendarService {

    GeneralCalendarRepository generalCalendarRepository;
    UtilService utilService;
    AppointmentTypeService appointmentTypeService;
    AddWorkerService addWorkerService;
    CabinetService cabinetService;
    PatientService patientService;
    GeneralCalendarMapper generalCalendarMapper;

    /** Eyni kabinetdə və ya eyni həkimdə vaxtı üst-üstə düşən (ləğv olunmamış) randevu varsa rədd edir */
    private void requireFreeSlot(Long selfId, Cabinet cabinet, BaseUser doctor, LocalDate date,
                                 LocalTime time, LocalTime period) {
        if (date == null || time == null) return;
        int start = minutes(time);
        int end = start + durationMinutes(period);
        for (GeneralCalendar other : generalCalendarRepository.findAllByDateAndAppointmentNot(date, Appointment.CANCELED)) {
            if (other.getId().equals(selfId) || other.getTime() == null) continue;
            int otherStart = minutes(other.getTime());
            int otherEnd = otherStart + durationMinutes(other.getPeriod());
            if (start >= otherEnd || otherStart >= end) continue;
            if (cabinet != null && other.getCabinet() != null && cabinet.getId().equals(other.getCabinet().getId())) {
                throw new ExistsException("Bu vaxtda kabinet (" + cabinet.getCabinetName() + ") artıq məşğuldur: " + other.getTime());
            }
            if (doctor != null && other.getBaseUser() != null && doctor.getId().equals(other.getBaseUser().getId())) {
                throw new ExistsException("Bu vaxtda həkimin artıq randevusu var: " + other.getTime());
            }
        }
    }

    private static int minutes(LocalTime t) {
        return t.getHour() * 60 + t.getMinute();
    }

    /** period müddəti saat:dəqiqə kimi saxlayır (məs. 01:00 = 1 saat); verilməyibsə 1 saat */
    private static int durationMinutes(LocalTime period) {
        int m = period == null ? 60 : minutes(period);
        return m > 0 ? m : 60;
    }

    public List<GeneralCalendarResponse> readDoctors() {
        List<BaseUser> doctors = addWorkerService.readAll();
        return doctors.stream()
                .map(doctor -> new GeneralCalendarResponse(
                        doctor.getId(),
                        doctor.getName(),
                        doctor.getSurname(),
                        doctor.getUsername()
                ))
                .toList();
    }

    @Transactional
    public NewAppointmentResponse newAppointment(NewAppointmentRequest newAppointmentRequest) {
        Patient patient = utilService.findByPatientId(newAppointmentRequest.getPatientId());
        boolean existsByPatientId = generalCalendarRepository.existsActivePatientById(patient.getId());
        Cabinet cabinet = cabinetService.findByCabinetName(newAppointmentRequest.getCabinetName());
        if (!existsByPatientId) {
            throw new ExistsException("Bu patient artiq randevu goturub");
        }

        Set<AppointmentType> appointmentTypes = newAppointmentRequest.getAppointmentTypeRequestIds().stream()
                .map(AppointmentTypeRequestId::getId)
                .map(appointmentTypeService::findById)
                .collect(Collectors.toSet());

        requireFreeSlot(null, cabinet, patient.getBaseUser(), newAppointmentRequest.getDate(),
                newAppointmentRequest.getTime(), newAppointmentRequest.getPeriod());

        GeneralCalendar generalCalendar = GeneralCalendar.builder()
                .baseUser(patient.getBaseUser())
                .patient(patient)
                .appointment(newAppointmentRequest.getAppointment())
                .cabinet(cabinet)
                .date(newAppointmentRequest.getDate())
                .time(newAppointmentRequest.getTime())
                .appointmentTypes(appointmentTypes)
                .period(newAppointmentRequest.getPeriod())
                .build();
        generalCalendarRepository.save(generalCalendar);

        List<AppointmentTypeResponse> appointmentTypeResponses = appointmentTypes.stream()
                .map(type -> AppointmentTypeResponse.builder()
                        .id(type.getId())
                        .appointmentTypeName(type.getAppointmentTypeName())
                        .time(type.getTime())
                        .status(type.getStatus())
                        .build())
                .toList();

        return new NewAppointmentResponse(
                patient.getBaseUser().getName(),
                generalCalendar.getCabinet().getCabinetName(),
                patient.getName(),
                generalCalendar.getAppointment(),
                generalCalendar.getDate(),
                appointmentTypeResponses,
                generalCalendar.getTime(),
                generalCalendar.getPeriod()
        );
    }

    public List<SelectingDoctorViewingPatientResponse> selectingDoctorViewingPatient(UUID doctorId) {
        List<SelectingDoctorViewingPatientResponse> allByDoctorId = generalCalendarRepository.findAllByDoctorId(doctorId);
        if (allByDoctorId.isEmpty()){
            throw new DoctorIsPatientsWereNotFound("pasientler tapilmadi");
        }
        return allByDoctorId;
    }

    public SelectingPatientToReadResponse selectingPatientToRead(Long patientId) {
        return generalCalendarRepository.findByPatientId(patientId)
                .orElseThrow(() -> new NoSuchPatientWasFound("bele bir pasient tapilmadi"));
    }

    public List<SelectingDoctorViewingPatientResponse> selectingRoomViewingPatient(String cabinetName) {
        List<SelectingDoctorViewingPatientResponse> allRoom = generalCalendarRepository.findAllCabinetName(cabinetName);
        if (allRoom.isEmpty()){
            throw new DoctorIsPatientsWereNotFound("pasientler tapilmadi");
        }
        return allRoom;
    }


    public String delete(Long id) {
        GeneralCalendar generalCalendar = findById(id);
        String name = generalCalendar.getPatient().getName();
        generalCalendarRepository.delete(generalCalendar);
        return "Bu :"+ name +"pasient silindi";
    }

    @Transactional
    public NewAppointmentResponse update(UpdateAppointmentRequest updateAppointmentRequest) {
        GeneralCalendar generalCalendar = findById(updateAppointmentRequest.getId());
        if (updateAppointmentRequest.getDoctorId() != null) {
            generalCalendar.setBaseUser(utilService.findByBaseUserId(updateAppointmentRequest.getDoctorId()));
        }
        if (updateAppointmentRequest.getPatientId() != null) {
            generalCalendar.setPatient(utilService.findByPatientId(updateAppointmentRequest.getPatientId()));
        }
        if (updateAppointmentRequest.getCabinetName() != null) {
            generalCalendar.setCabinet(cabinetService.findByCabinetName(updateAppointmentRequest.getCabinetName()));
        }
        utilService.updateFieldIfPresent(updateAppointmentRequest.getAppointment(), generalCalendar::setAppointment);
        utilService.updateFieldIfPresent(updateAppointmentRequest.getDate(), generalCalendar::setDate);
        utilService.updateFieldIfPresent(updateAppointmentRequest.getTime(), generalCalendar::setTime);
        utilService.updateFieldIfPresent(updateAppointmentRequest.getPeriod(), generalCalendar::setPeriod);
        requireFreeSlot(generalCalendar.getId(), generalCalendar.getCabinet(), generalCalendar.getBaseUser(),
                generalCalendar.getDate(), generalCalendar.getTime(), generalCalendar.getPeriod());
        generalCalendarRepository.save(generalCalendar);

        return NewAppointmentResponse.builder()
                .doctorName(generalCalendar.getBaseUser().getName())
                .patientName(generalCalendar.getPatient().getName())
                .cabinetName(generalCalendar.getCabinet().getCabinetName())
                .appointment(generalCalendar.getAppointment())
                .date(generalCalendar.getDate())
                .time(generalCalendar.getTime())
                .period(generalCalendar.getPeriod())
                .build();
    }

    public GeneralCalendar findById(Long id) {
        return generalCalendarRepository.findById(id)
                .orElseThrow(() -> new NoSuchPatientWasFound("bele bir pasient tapilmadi"));
    }

    public SelectingPatientToReadResponse findByPatientId(Long patientId) {
        return generalCalendarRepository.findByPatientId(patientId)
                .orElseThrow(() -> new NoSuchPatientWasFound("bele bir patient tapilmadi"));
    }

    public List<ReadRooms> read() {
        List<Cabinet> cabinets = cabinetService.findAllByCabinetName();
        return generalCalendarMapper.toCabinetDto(cabinets.stream()
            .filter(cabinet -> cabinet.getCabinetName() != null)
            .collect(Collectors.toList()));
}
}