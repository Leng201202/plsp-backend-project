# NestJS Data Transformation Patterns

This guide explains how to manage DTO responses when dealing with TypeORM relations, specifically how to toggle between returning just an **ID** or the **Full Object**.

## 1. The "@Transform" Pattern (Current)
This is the simplest way to collapse a relation into a single ID.

```typescript
import { Transform } from 'class-transformer';

export class StatusResponseDto {
  @Transform(({ value }) => value?.id)
  created_by!: number;
}
```
**Pros:** Very clean API responses.
**Cons:** Hard to get the full object when you actually need it.

---

## 2. The "Two-Field" Group Pattern
This allows you to expose different data structures under different keys using `class-transformer` groups.

### Step 1: Define the DTO
```typescript
import { Expose, Transform } from 'class-transformer';

export class StatusResponseDto {
  id!: string;
  name!: string;

  // Key: 'created_by' -> only numeric ID
  @Expose({ groups: ['compact'] })
  @Transform(({ value }) => value?.id)
  created_by!: number;

  // Key: 'created_by_detail' -> full object
  @Expose({ groups: ['full'] })
  @Transform(({ obj }) => obj.created_by) // Points to original entity relation
  created_by_detail!: any; 
}
```

### Step 2: Use in Service
```typescript
// For findAll (Compact)
return plainToInstance(StatusResponseDto, data, { groups: ['compact'] });

// For findOne (Full)
return plainToInstance(StatusResponseDto, data, { groups: ['full'] });
```

---

## 3. The "Conditional Logic" Pattern
Keep a single API key but change the data type (Number vs Object) dynamically.

### Step 1: Define the DTO
```typescript
import { Transform } from 'class-transformer';

export class StatusResponseDto {
  id!: string;

  @Transform(({ value, options }) => {
    // If the 'full' group is active, return the whole object
    if (options?.groups?.includes('full')) {
      return value;
    }
    // Default behavior: return just the ID
    return value?.id;
  })
  created_by!: any;
}
```

### Step 2: Use in Service
```typescript
// Returns { "created_by": 1 }
return plainToInstance(StatusResponseDto, data);

// Returns { "created_by": { "id": 1, "firstname": "Admin", ... } }
return plainToInstance(StatusResponseDto, data, { groups: ['full'] });
```

---

## Recommendations
| Scenario | Recommended Pattern |
| :--- | :--- |
| **Strict Type Safety** | **Two-Field Group Pattern** (Pattern #2). Frontend developers will find it easier to work with distinct keys. |
| **Maintain Generic Keys** | **Conditional Logic Pattern** (Pattern #3). Best if you want the JSON structure to remain identical but flexible. |
| **Quick Internal APIs** | **Simple @Transform** (Pattern #1). Best for internal/private modules where details aren't needed. |
