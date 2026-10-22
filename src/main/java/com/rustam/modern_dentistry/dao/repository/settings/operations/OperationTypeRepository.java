package com.rustam.modern_dentistry.dao.repository.settings.operations;

import com.rustam.modern_dentistry.dto.projection.OperationCategoryProjection;
import com.rustam.modern_dentistry.dto.response.read.OpInsuranceReadResponse;
import com.rustam.modern_dentistry.dao.entity.settings.operations.OpType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface OperationTypeRepository extends JpaRepository<OpType, Long>, JpaSpecificationExecutor<OpType> {

    @EntityGraph(attributePaths = {"insurances", "opTypeItems"})
    Optional<OpType> findById(Long id);

    @EntityGraph(attributePaths = {"opTypeItems"})
    List<OpType> findAll();

    @EntityGraph(attributePaths = {"opTypeItems"})
    Page<OpType> findAll(Pageable pageable);

    @EntityGraph(attributePaths = {"opTypeItems"})
    Page<OpType> findAll(Specification<OpType> spec, Pageable pageable);


    @Query("""
            select new com.rustam.modern_dentistry.dto.response.read.OpInsuranceReadResponse(
                d.id as insuranceCompanyId,
                d.companyName, 
                i.deductiblePercentage
            ) 
            from InsuranceCompany d 
            left join OpTypeInsurance i ON i.insuranceCompany.id = d.id AND (i.opType.id = :opTypeId OR i.opType.id IS NULL)
            """)
    List<OpInsuranceReadResponse> findByOpTypeId(@Param("opTypeId") Long opTypeId);

    Optional<OpType> findByCategoryName(String operationCategoryName);

    @EntityGraph(attributePaths = {"opTypeItems"})
    Page<OpType> findByInsuranceCompanyId(Long insuranceCompanyId, Pageable pageable);

    @EntityGraph(attributePaths = {"opTypeItems"})
    Page<OpType> findByInsuranceCompanyIsNull(Pageable pageable);

    @Query(value = """
            SELECT 
                ot.id as categoryId,
                ot.category_name as categoryName,
                ot.category_code as categoryCode,
                opi.id as operationId,
                opi.operation_name as name,
                opi.amount as amount,
                opi.operation_code as operationCode,
                COALESCE(opi.status, 'ACTIVE') as status
            FROM op_types ot
            INNER JOIN op_type_items opi ON ot.id = opi.op_type_id
            WHERE (ot.status IS NULL OR ot.status = 'ACTIVE')
              AND (opi.status IS NULL OR opi.status = 'ACTIVE')
              AND (
                  (:insuranceId IS NOT NULL AND :insuranceId > 0 AND ot.insurance_company_id = :insuranceId)
                  OR ((:insuranceId IS NULL OR :insuranceId = 0) AND ot.insurance_company_id IS NULL)
              )
            ORDER BY ot.id, opi.id
            """, nativeQuery = true)
    List<OperationCategoryProjection> findAllByInsuranceToCategoryOfOperations(@Param("insuranceId") Long insuranceId);
}
