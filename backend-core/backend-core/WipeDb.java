import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.Statement;

public class WipeDb {
    public static void main(String[] args) {
        String url = "jdbc:postgresql://localhost:5432/uniconnect_db";
        String user = "uniconnect_user";
        String password = "uniconnect_password";

        try (Connection conn = DriverManager.getConnection(url, user, password);
             Statement stmt = conn.createStatement()) {
            
            stmt.executeUpdate("TRUNCATE TABLE course_instance CASCADE;");
            System.out.println("Courses wiped successfully.");
            
        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}
