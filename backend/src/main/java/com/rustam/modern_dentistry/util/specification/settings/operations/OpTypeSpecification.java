package com.rustam.modern_dentistry.util.specification.settings.operations;

import com.rustam.modern_dentistry.dao.entity.settings.operations.OpType;
import com.rustam.modern_dentistry.dto.request.read.OperationTypeSearchRequest;
import jakarta.persistence.criteria.Predicate;
import org.springframework.data.jpa.domain.Specification;

import java.util.ArrayList;
import java.util.List;

public class OpTypeSpecification {

    public static Specification<OpType> filterBy(OperationTypeSearchRequest request) {

        return (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            if (request.getStatus() != null) {
                predicates.add(cb.equal(root.get("status"), request.getStatus()));
            }
            if (request.getCategoryName() != null && !request.getCategoryName().isEmpty()) {
                predicates.add(cb.like(cb.lower(root.get("categoryName")), "%" + request.getCategoryName().toLowerCase() + "%"));
            }
            if (request.getInsuranceCompanyId() != null && request.getInsuranceCompanyId() > 0) {
                predicates.add(cb.equal(root.get("insuranceCompany").get("id"), request.getInsuranceCompanyId()));
            } else {
                predicates.add(cb.isNull(root.get("insuranceCompany")));
            }
            return cb.and(predicates.toArray(new Predicate[0]));
        };
    }
}
