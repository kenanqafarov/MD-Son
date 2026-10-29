# Builds the jar inside Docker, so the server needs no JDK or prebuilt jar
FROM eclipse-temurin:17-jdk AS build
WORKDIR /src
COPY gradlew settings.gradle build.gradle ./
COPY gradle gradle
RUN chmod +x gradlew && ./gradlew dependencies --no-daemon -q > /dev/null
COPY src src
RUN ./gradlew bootJar --no-daemon -x test

FROM eclipse-temurin:17-jre
WORKDIR /app
COPY --from=build /src/build/libs/*.jar app.jar
ENV JAVA_OPTS="-XX:+UseG1GC -XX:+UseStringDeduplication -Xms512m -Xmx1536m -XX:MaxGCPauseMillis=200 -Djava.security.egd=file:/dev/./urandom"
EXPOSE 5555
CMD ["sh", "-c", "exec java $JAVA_OPTS -jar app.jar"]
