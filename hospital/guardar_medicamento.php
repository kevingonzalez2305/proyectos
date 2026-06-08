<?php
include("conexion.php");

$nombre = $_POST['nombre'];
$uso_medicamento = $_POST['uso_medicamento'];
$ciudad = $_POST['ciudad'];

$sql_id = "
SELECT MIN(t1.id_medicamento + 1) AS siguiente_id
FROM medicamentos t1
LEFT JOIN medicamentos t2 ON t1.id_medicamento + 1 = t2.id_medicamento
WHERE t2.id_medicamento IS NULL
";

$resultado = mysqli_query($conexion, $sql_id);
$fila = mysqli_fetch_assoc($resultado);

$id = $fila['siguiente_id'];

if($id == null){
    $id = 1;
}

$sql = "INSERT INTO medicamentos (id_medicamento, nombre, uso_medicamento, ciudad)
VALUES ('$id', '$nombre', '$uso_medicamento', '$ciudad')";

if(mysqli_query($conexion, $sql)){
    echo "Medicamento guardado. <a href='http://localhost/hospital/index.html'>Volver</a>";
} else {
    echo "Error: " . mysqli_error($conexion);
}
?>