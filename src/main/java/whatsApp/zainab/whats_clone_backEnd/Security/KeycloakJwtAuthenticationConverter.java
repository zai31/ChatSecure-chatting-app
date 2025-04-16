package whatsApp.zainab.whats_clone_backEnd.Security;

import lombok.NonNull;
import org.springframework.boot.autoconfigure.amqp.RabbitProperties;
import org.springframework.core.convert.converter.Converter;
import org.springframework.security.authentication.AbstractAuthenticationToken;
import org.springframework.security.authentication.jaas.JaasAuthenticationToken;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken;
import org.springframework.security.oauth2.server.resource.authentication.JwtGrantedAuthoritiesConverter;

import java.util.Collection;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Stream;

import static java.util.stream.Collectors.toSet;
//This class takes a JWT token (which is like an ID card for users) and extracts the roles from it

public class KeycloakJwtAuthenticationConverter implements Converter<Jwt, AbstractAuthenticationToken> {
    //Converts JWT into an Authentication Object,convert it from keycloak to spring
    @Override
    public AbstractAuthenticationToken convert(@NonNull Jwt source) {

        return new JwtAuthenticationToken(source, Stream.concat(//jwt consisting of roles+authorities
                new JwtGrantedAuthoritiesConverter().convert(source).stream()//R/W
                , extractResourceRoles(source).stream()).collect(toSet()));//ROLES:admin
    }

    //Collection<T> → A collection that holds objects of type T.
    //GrantedAuthority → A Spring Security interface that represents user roles.
    //? extends GrantedAuthority → Means "any class that is a subclass of GrantedAuthority."
    //? extends GrantedAuthority → Allows Any Subclass of GrantedAuthority
    private Collection<? extends GrantedAuthority> extractResourceRoles(Jwt jwt) {
        var resourceAccess = new HashMap<>(jwt.getClaim("resource_access"));//key is account,value:map of roles key

        var eternal = (Map<String, List<String>>) resourceAccess.get("account");//

        var roles = eternal.get("roles");

        return roles.stream()
                .map(role -> new SimpleGrantedAuthority("ROLE_" + role.replace("-", "_")))
                .collect(toSet());
    }

}
