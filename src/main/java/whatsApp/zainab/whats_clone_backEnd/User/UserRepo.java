package whatsApp.zainab.whats_clone_backEnd.User;

import org.apache.catalina.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface UserRepo extends JpaRepository<Users, UUID> {

    @Query(name = UserConstants.FIND_USER_BY_EMAIL)
    Optional<Users> findByEmail(@Param("email") String userEmail);

    @Query(name = UserConstants.FIND_ALL_USERS_EXCEPT_SELF)
    List<Users> findAllUsersExceptSelf(@Param("publicId") UUID publicId);

    @Query(name = UserConstants.FIND_USER_BY_PUBLIC_ID)
    Optional<Users> findById(@Param("publicId") UUID senderId);

}
