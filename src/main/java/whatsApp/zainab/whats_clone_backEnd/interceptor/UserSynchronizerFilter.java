package whatsApp.zainab.whats_clone_backEnd.interceptor;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.AnonymousAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;
import whatsApp.zainab.whats_clone_backEnd.User.UserSynchronizer;

import java.io.IOException;
@Component
@RequiredArgsConstructor//Spring automatically injects dependencies.

// this class should extracts user credintials from token, then sycnch it with user's db
public class UserSynchronizerFilter extends OncePerRequestFilter //insures this filter executes only once per request
{

    private final UserSynchronizer userSynchronizer;
    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response, FilterChain filterChain) throws ServletException, IOException {
    if(!(SecurityContextHolder.getContext().getAuthentication() instanceof AnonymousAuthenticationToken))
    //retrieves the current authenticated user.
        //the user is not logged in, so we skip synchronization.
    {
        JwtAuthenticationToken jwtAuthenticationToken = (JwtAuthenticationToken) SecurityContextHolder.getContext().getAuthentication();
        //extract first/Converts the authentication object into JwtAuthenticationToken to access user details.
        userSynchronizer.synchronizeWithIdp(jwtAuthenticationToken.getToken());
        //Passes the token to UserSynchronizer, which syncs the user’s info with the local database.
    }
    filterChain.doFilter(request, response);
//filterChain.doFilter(request, response); ensures the request continues processing.
    }
}
