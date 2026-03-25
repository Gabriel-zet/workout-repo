# Database ERD (Prisma)

```mermaid
erDiagram
  User ||--o{ Workout : "tem"
  User ||--o{ Exercise : "possui"

  Workout ||--o{ WorkoutExercise : "contém"
  Exercise ||--o{ WorkoutExercise : "usado_em"

  WorkoutExercise ||--o{ Set : "tem"

  User {
    Int id
    String email
    String name
    String passwordHash
    DateTime createdAt
  }

  Workout {
    String id
    DateTime date
    String title
    String notes
    DateTime createdAt
    DateTime updatedAt
    Int userId
  }

  Exercise {
    String id
    String name
    DateTime createdAt
    DateTime updatedAt
    Int userId
  }

  WorkoutExercise {
    String id
    Int order
    String notes
    DateTime createdAt
    DateTime updatedAt
    String workoutId
    String exerciseId
  }

  Set {
    String id
    Int order
    Int reps
    Decimal weight
    DateTime createdAt
    DateTime updatedAt
    String workoutExerciseId
  }
```